import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// ---- MySQL CONNECTION ----
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// Logging middleware to debug requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

const dataPath = path.join(process.cwd(), "data", "mealPlanHistory.json");

// Ensure data directory exists (with error handling)
const dataDir = path.dirname(dataPath);
try {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log(`Created data directory: ${dataDir}`);
  }
} catch (err) {
  console.error(`Error creating data directory:`, err);
}

//#######################################################################
// Root route
app.get("/", (req, res) => {
  res.json({ 
    message: "Meal Plan API Server",
    endpoints: {
      "GET /api/data": "Get meal plan data",
      "POST /api/upload": "Upload meal plan snapshot"
    }
  });
});

// GET data - Read from MySQL
app.get("/api/data", async (req, res) => {
  try {
    const userId = req.query.user_id || 1; // Default to user 1

    // Query transactions from database
    const [rows] = await pool.query(
      `SELECT id, date as dateTime, amount, category, description, payment_method, source
       FROM transactions
       WHERE user_id = ?
       ORDER BY date DESC`,
      [userId]
    );

    // Format transactions to match extension format
    const transactions = rows.map(row => ({
      dateTime: row.dateTime,
      type: row.description ? row.description.split(' - ')[0] : 'TRANSACTION',
      terminal: row.description ? row.description.split(' - ')[1] : 'Unknown',
      status: 'Approved',
      balance: '1',
      units: '0',
      amount: `$-${row.amount.toFixed(2)}`,
      category: row.category,
      source: row.source
    }));

    // Calculate category summary
    const categorySummary = {};
    rows.forEach(row => {
      if (!categorySummary[row.category]) {
        categorySummary[row.category] = { count: 0, spent: 0 };
      }
      categorySummary[row.category].count++;
      categorySummary[row.category].spent += parseFloat(row.amount);
    });

    res.json({
      timestamp: new Date().toISOString(),
      transactionCount: transactions.length,
      transactions,
      categorySummary
    });
  } catch (err) {
    console.error('Error fetching from database:', err);
    // Fallback to JSON file if database fails
    try {
      if (fs.existsSync(dataPath)) {
        const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
        res.json(Array.isArray(data) ? {
          timestamp: new Date().toISOString(),
          transactionCount: data.length,
          transactions: data,
        } : data);
      } else {
        res.json({
          timestamp: new Date().toISOString(),
          transactionCount: 0,
          transactions: [],
        });
      }
    } catch (fallbackErr) {
      console.error('Fallback error:', fallbackErr);
      res.status(500).send("Error reading data");
    }
  }
});

// Helper function to check if two transactions are duplicates
// Compares key fields that uniquely identify a transaction
function isDuplicateTransaction(tx1, tx2) {
  return (
    tx1.dateTime === tx2.dateTime &&
    tx1.type === tx2.type &&
    tx1.terminal === tx2.terminal &&
    tx1.amount === tx2.amount &&
    tx1.status === tx2.status
  );
}

// Helper function to check if a transaction already exists in an array
function transactionExists(transaction, existingTransactions) {
  return existingTransactions.some((existing) =>
    isDuplicateTransaction(transaction, existing)
  );
}

// POST data (from extension)
app.post("/api/upload", async (req, res) => {
  try {
    const newData = req.body;
    const newTransactions = Array.isArray(newData.transactions)
      ? newData.transactions
      : [];

    // Read existing data if it exists
    let existingTransactions = [];
    let existingCategorySummary = {};

    if (fs.existsSync(dataPath)) {
      try {
        const existingData = JSON.parse(fs.readFileSync(dataPath, "utf8"));
        // Handle both array format (old) and object format (new)
        if (Array.isArray(existingData)) {
          existingTransactions = existingData;
        } else if (existingData.transactions && Array.isArray(existingData.transactions)) {
          existingTransactions = existingData.transactions;
          existingCategorySummary = existingData.categorySummary || {};
        }
      } catch (readErr) {
        console.error("Error reading existing data:", readErr);
        // Continue with empty existing data if read fails
      }
    }

    // Filter out duplicates: only keep transactions that don't already exist
    const uniqueNewTransactions = newTransactions.filter(
      (newTx) => !transactionExists(newTx, existingTransactions)
    );

    // Merge transactions: existing + new unique ones
    const mergedTransactions = [...existingTransactions, ...uniqueNewTransactions];

    // Update the data structure
    const mergedData = {
      timestamp: new Date().toISOString(),
      transactionCount: mergedTransactions.length,
      transactions: mergedTransactions,
      // Use the new categorySummary if provided, otherwise keep existing
      categorySummary: newData.categorySummary || existingCategorySummary,
    };

    // Save merged data to JSON file
    fs.writeFileSync(dataPath, JSON.stringify(mergedData, null, 2), "utf8");

    // ---- NEW: Save to MySQL ----
    let dbAddedCount = 0;
    for (const tx of uniqueNewTransactions) {
      try {
        // Parse transaction data
        const dateTime = new Date(tx.dateTime);
        const amount = parseFloat(tx.amount.replace('$', '').replace('-', ''));

        // Default user_id = 1 (you'll need to handle user authentication later)
        const userId = 1;

        // Determine category from transaction type/terminal
        let category = 'Other';
        if (tx.terminal.includes('MARKET') || tx.terminal.includes('BRUBAKERS')) {
          category = 'ResHalls';
        } else if (tx.terminal.includes('STARBUCKS') || tx.terminal.includes('JUICE')) {
          category = 'Café';
        } else if (tx.terminal.includes('LAUNDRY')) {
          category = 'Laundry';
        } else if (tx.terminal.includes('BROWSERS')) {
          category = 'Restaurants';
        }

        // Insert into database
        await pool.query(
          `INSERT INTO transactions
           (user_id, date, amount, category, description, payment_method, source)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE amount=VALUES(amount)`,
          [
            userId,
            dateTime,
            amount,
            category,
            `${tx.type} - ${tx.terminal}`,
            'WatCard',
            'scraped'
          ]
        );
        dbAddedCount++;
      } catch (dbErr) {
        console.error('Error inserting transaction to DB:', dbErr.message);
        // Continue with other transactions even if one fails
      }
    }

    const addedCount = uniqueNewTransactions.length;
    const skippedCount = newTransactions.length - addedCount;

    console.log(
      `📝 Upload processed: ${addedCount} new transactions added, ${skippedCount} duplicates skipped. Total: ${mergedTransactions.length}. DB: ${dbAddedCount} saved to MySQL.`
    );

    res.json({
      status: "success",
      added: addedCount,
      skipped: skippedCount,
      total: mergedTransactions.length,
      dbSaved: dbAddedCount
    });
  } catch (err) {
    console.error("Error processing upload:", err);
    res.status(500).send("Error writing data");
  }
});

//#####################################################################

// Handle Chrome DevTools discovery endpoint (prevents CSP warning)
app.get("/.well-known/appspecific/com.chrome.devtools.json", (req, res) => {
  res.status(404).json({});
});

// Catch-all route for unknown endpoints (prevents 404 errors)
app.use((req, res) => {
  console.log(`Unknown endpoint: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: "Endpoint not found",
    path: req.path,
    method: req.method
  });
});

const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Ready to accept connections`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Please stop the other process or use a different port.`);
    console.error(`Tip: Run 'lsof -ti:4000 | xargs kill -9' to kill processes on port 4000`);
  } else {
    console.error(`Server error:`, err);
  }
  process.exit(1);
});
