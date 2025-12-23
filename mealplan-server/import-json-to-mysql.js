import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

async function importTransactions() {
  try {
    console.log('🔄 Starting import...');

    // Check default user exists
    try {
      const [users] = await pool.query('SELECT user_id FROM users WHERE email = ?', ['user@uwaterloo.ca']);
      if (users.length === 0) {
        console.log('❌ Default user not found - please create user first');
        process.exit(1);
      } else {
        console.log(`✅ Using user_id: ${users[0].user_id}`);
      }
    } catch (err) {
      console.error('Error with user:', err.message);
    }

    const dataPath = path.join(process.cwd(), 'data', 'mealPlanHistory.json');
    if (!fs.existsSync(dataPath)) {
      console.log('❌ No mealPlanHistory.json found');
      return;
    }

    const jsonData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const transactions = jsonData.transactions || [];

    console.log(`📊 Found ${transactions.length} transactions`);

    let imported = 0;
    for (const tx of transactions) {
      try {
        const [datePart, timePart] = tx.dateTime.split(' ');
        const amount = parseFloat(tx.amount.replace('$', '').replace('-', ''));

        let category = 'Other';
        if (tx.terminal.includes('MARKET') || tx.terminal.includes('BRUBAKERS')) category = 'ResHalls';
        else if (tx.terminal.includes('STARBUCKS') || tx.terminal.includes('JUICE')) category = 'Café';
        else if (tx.terminal.includes('LAUNDRY')) category = 'Laundry';
        else if (tx.terminal.includes('BROWSERS')) category = 'Restaurants';
        else if (tx.terminal.includes('W STORE')) category = 'W Store';

        const watcardTxId = `${tx.dateTime}_${tx.terminal}_${amount}`.replace(/\s+/g, '_');

        await pool.query(
          `INSERT INTO transactions
           (user_id, date, time, amount, vendor, category, description, is_manual, watcard_transaction_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)
           ON DUPLICATE KEY UPDATE amount=VALUES(amount)`,
          [35, datePart, timePart || null, amount, tx.terminal, category, tx.type, watcardTxId]
        );
        imported++;
      } catch (err) {
        console.error(`Failed to import transaction: ${tx.dateTime} - ${err.message}`);
      }
    }

    console.log(`✅ Imported ${imported} transactions to MySQL`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Import failed:', err);
    process.exit(1);
  }
}

importTransactions();
