import mysql from 'mysql2/promise';

async function checkAndCreateTable() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'meal_plan_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    // Check if table exists
    const [tables] = await pool.query(`SHOW TABLES LIKE 'user_settings'`);
    
    if (tables.length === 0) {
      console.log('user_settings table does not exist. Creating it...');
      
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS user_settings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          settings_json JSON NOT NULL COMMENT 'JSON object containing views, categories, budgets, labels, and other settings',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
          UNIQUE KEY unique_user_settings (user_id),
          INDEX idx_user_id (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `;
      
      await pool.query(createTableSQL);
      console.log('✅ user_settings table created successfully!');
    } else {
      console.log('✅ user_settings table already exists');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkAndCreateTable();
