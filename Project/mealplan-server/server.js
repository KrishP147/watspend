import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import passport from "passport";
import session from "express-session";
import { setupAuth, generateToken, authenticateToken } from "./auth.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Production-ready CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'https://secure.touchnet.net',
  'https://*.touchnet.net'
];

// Add production frontend URL if different from FRONTEND_URL
if (process.env.VERCEL_URL) {
  allowedOrigins.push(`https://${process.env.VERCEL_URL}`);
}

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or extensions)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        const pattern = allowed.replace('*', '.*');
        return new RegExp(pattern).test(origin);
      }
      return allowed === origin;
    });
    
    if (isAllowed || origin.startsWith('chrome-extension://')) {
      return callback(null, true);
    }
    
    // In production, be more permissive for Vercel preview URLs
    if (origin.includes('.vercel.app')) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
// Also allow requests from touchnet and extensions
app.use((req, res, next) => {
  const origin = req.headers.origin;
  // Allow touchnet origins (for content script direct fetch)
  if (origin && origin.includes('touchnet.net')) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  }
  // Chrome extensions send origin as null or chrome-extension://...
  if (!origin || origin.startsWith('chrome-extension://')) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  }
  next();
});
app.use(express.json());

// Session configuration for Passport
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // Required for cross-origin cookies
    }
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// ---- MySQL CONNECTION ----
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// Ensure required tables exist on startup
async function ensureTablesExist() {
  try {
    // Check if user_settings table exists
    const [tables] = await pool.query(`SHOW TABLES LIKE 'user_settings'`);
    
    if (tables.length === 0) {
      console.log('📋 user_settings table does not exist. Creating it...');
      
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
      // Table exists - check if it has the settings_json column
      const [columns] = await pool.query(`SHOW COLUMNS FROM user_settings LIKE 'settings_json'`);
      if (columns.length === 0) {
        console.log('📋 Adding settings_json column to user_settings table...');
        await pool.query(`ALTER TABLE user_settings ADD COLUMN settings_json JSON NOT NULL DEFAULT (JSON_OBJECT())`);
        console.log('✅ settings_json column added successfully!');
      } else {
        console.log('✅ user_settings table exists with settings_json column');
      }
    }
  } catch (error) {
    console.error('⚠️ Error checking/creating tables:', error.message);
    // Don't crash - settings endpoints will just fail gracefully
  }
}

// Run table check on startup
ensureTablesExist();

// Setup authentication with database pool
setupAuth(pool);

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

const dataPath = path.join(process.cwd(), "data", "mealPlanHistory.json");

// Ensure data directory exists
const dataDir = path.dirname(dataPath);
try {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
} catch (err) {
  console.error(`Error creating data directory:`, err);
}

// Initialize default user on startup
async function ensureDefaultUser() {
  try {
    const [users] = await pool.query('SELECT user_id FROM users WHERE user_id = 1');
    if (users.length === 0) {
      await pool.query(
        `INSERT INTO users (email, google_id, first_name, last_name, created_at)
         VALUES (?, ?, ?, ?, NOW())`,
        ['user@uwaterloo.ca', 'temp_google_id', 'Default', 'User']
      );
      console.log('✅ Created default user (ID: 1)');
    }
  } catch (err) {
    console.error('Warning: Could not create default user:', err.message);
  }
}
ensureDefaultUser();

//###################################################################
// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Meal Plan API Server",
    endpoints: {
      "GET /api/data": "Get meal plan data from MySQL",
      "POST /api/upload": "Upload meal plan snapshot to MySQL",
      "GET /api/auth/verify": "Verify authentication status"
    }
  });
});

// Auth registration endpoint
app.post("/api/auth/register", async (req, res) => {
  console.log("📝 Registration request received:", req.body);
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log("❌ Missing email or password");
      return res.status(400).json({ error: "Email and password required" });
    }
    
    // For now, create a simple user without password hashing (demo purposes)
    // In production, use bcrypt to hash passwords
    const [result] = await pool.query(
      `INSERT INTO users (email, google_id, first_name, last_name, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [email, 'local_' + Date.now(), email.split('@')[0], 'User']
    );
    
    // Generate proper JWT token (same as Google login)
    const token = generateToken(result.insertId);
    
    console.log("✅ User registered successfully:", email);
    res.json({
      token,
      user: {
        id: result.insertId,
        email: email
      },
      message: "Registration successful"
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: "Email already registered" });
    } else {
      console.error("Registration error:", err);
      res.status(500).json({ error: "Registration failed" });
    }
  }
});

// Auth login endpoint
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }
    
    // Find user by email
    const [users] = await pool.query(
      `SELECT user_id, email FROM users WHERE email = ?`,
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    
    const user = users[0];
    
    // Generate proper JWT token (same as Google login)
    const token = generateToken(user.user_id);
    
    console.log("✅ Login successful for:", email);
    
    res.json({
      token,
      user: {
        id: user.user_id,
        email: user.email
      },
      message: "Login successful"
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// ==================== HEALTH CHECK ====================
// Simple endpoint to check if backend is running (no auth required)
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ==================== AUTHENTICATION ROUTES ====================

// Initiate Google OAuth
app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google OAuth callback
app.get(
  "/api/auth/google/callback",
  passport.authenticate("google", { failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed` }),
  (req, res) => {
    // Generate JWT token
    const token = generateToken(req.user.user_id);

    // Redirect to frontend with token and email
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&email=${req.user.email}`);
  }
);

// Verify JWT token
app.get("/api/auth/verify", authenticateToken, async (req, res) => {
  try {
    // Get user info from database
    const [users] = await pool.query(
      'SELECT user_id, email FROM users WHERE user_id = ?',
      [req.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({ authenticated: false, valid: false, error: 'User not found' });
    }

    res.json({
      authenticated: true,
      valid: true,
      user: {
        id: users[0].user_id,
        email: users[0].email
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ authenticated: false, valid: false, error: 'Verification failed' });
  }
});

// GET data - Read from MySQL - REQUIRES AUTHENTICATION
app.get("/api/data", authenticateToken, async (req, res) => {
  try {
    const userId = req.userId; // From JWT token

    // Query transactions from database for this user
    const [rows] = await pool.query(
      `SELECT transaction_id, date, time, amount, vendor, location, category, description
       FROM transactions
       WHERE user_id = ?
       ORDER BY date DESC, time DESC`,
      [userId]
    );

    // Format transactions
    const transactions = rows.map(row => {
      const dateTime = row.time
        ? `${row.date.toISOString().split('T')[0]} ${row.time}`
        : row.date.toISOString().split('T')[0];

      return {
        dateTime,
        type: row.description || 'TRANSACTION',
        terminal: row.vendor || row.location || 'Unknown',
        status: 'Approved',
        balance: '1',
        units: '0',
        amount: `$-${parseFloat(row.amount).toFixed(2)}`,
        category: row.category
      };
    });

    // Calculate category summary
    const categorySummary = {};
    rows.forEach(row => {
      const cat = row.category;
      if (!categorySummary[cat]) {
        categorySummary[cat] = { count: 0, spent: 0 };
      }
      categorySummary[cat].count++;
      categorySummary[cat].spent += parseFloat(row.amount);
    });

    res.json({
      timestamp: new Date().toISOString(),
      transactionCount: transactions.length,
      transactions,
      categorySummary
    });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: "Database error", message: err.message });
  }
});

// Helper functions for duplicate detection
function isDuplicateTransaction(tx1, tx2) {
  return (
    tx1.dateTime === tx2.dateTime &&
    tx1.type === tx2.type &&
    tx1.terminal === tx2.terminal &&
    tx1.amount === tx2.amount
  );
}

function transactionExists(transaction, existingTransactions) {
  return existingTransactions.some(existing =>
    isDuplicateTransaction(transaction, existing)
  );
}

// POST data (from extension) - Save to MySQL
// Upload transactions - REQUIRES AUTHENTICATION
app.post("/api/upload", authenticateToken, async (req, res) => {
  console.log("📤 Upload request received");
  console.log("Headers:", req.headers.authorization ? "Has auth token" : "NO AUTH TOKEN");

  try {
    const userId = req.userId; // From JWT token
    const newData = req.body;
    const newTransactions = Array.isArray(newData.transactions)
      ? newData.transactions
      : [];

    console.log(`📤 Upload from user ${userId}: ${newTransactions.length} transactions`);
    
    // Debug: log first transaction to see format
    if (newTransactions.length > 0) {
      console.log("📤 Sample transaction:", JSON.stringify(newTransactions[0]));
    }

    // Get existing transactions from database for duplicate checking
    const [existingTxs] = await pool.query(
      'SELECT watcard_transaction_id FROM transactions WHERE user_id = ?',
      [userId]
    );
    const existingTxIds = new Set(existingTxs.map(t => t.watcard_transaction_id));

    // Filter out admin transactions before processing
    const filteredTransactions = newTransactions.filter(tx => {
      const type = tx.type || '';
      const terminal = tx.terminal || '';
      return !type.includes('PREPAYMENT (ADMIN)') &&
             !type.includes('ACCOUNT ADJUSTMENT') &&
             !terminal.includes('PREPAYMENT (ADMIN)') &&
             !terminal.includes('ACCOUNT ADJUSTMENT');
    });

    // Save to MySQL
    let dbAddedCount = 0;
    let skippedCount = 0;

    for (const tx of filteredTransactions) {
      try {
        const dateTimeStr = tx.dateTime; // e.g., "2025-11-18 16:46:36"
        const [datePart, timePart] = dateTimeStr.split(' ');
        const amount = parseFloat(tx.amount.replace('$', '').replace('-', ''));
        const terminal = tx.terminal || '';
        const type = tx.type || '';

        // Create unique transaction ID
        const watcardTxId = `${dateTimeStr}_${terminal}_${amount}`.replace(/\s+/g, '_');

        // Skip if already exists
        if (existingTxIds.has(watcardTxId)) {
          skippedCount++;
          continue;
        }

        // Save transaction first - category can be updated later
        await pool.query(
          `INSERT INTO transactions
           (user_id, date, time, amount, vendor, location, category, description, is_manual, watcard_transaction_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
          [
            userId,
            datePart,
            timePart || null,
            amount,
            terminal,
            null,
            'Uncategorized', // Simple default - user can categorize later
            type,
            watcardTxId
          ]
        );
        dbAddedCount++;
      } catch (dbErr) {
        console.error('Error inserting transaction:', dbErr.message);
      }
    }

    console.log(
      `✅ Upload complete for user ${userId}: ${dbAddedCount} added, ${skippedCount} duplicates skipped`
    );

    res.json({
      status: "success",
      added: dbAddedCount,
      skipped: skippedCount,
      total: dbAddedCount + skippedCount,
      userId
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed", message: err.message });
  }
});

// POST funds data (from extension scraping) - REQUIRES AUTHENTICATION
app.post("/api/upload-funds", authenticateToken, async (req, res) => {
  try {
    const fundsData = req.body;
    const userId = req.userId; // From JWT token

    console.log(`📊 Funds data uploaded from user ${userId}: Meal Plan: $${fundsData.mealPlanBalance || 0}, Flex: $${fundsData.flexDollarsBalance || 0}`);

    // Save funds data to database (user-specific)
    await pool.query(
      `INSERT INTO watcard_funds (user_id, meal_plan_balance, flex_dollars_balance, last_updated)
       VALUES (?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE
         meal_plan_balance = VALUES(meal_plan_balance),
         flex_dollars_balance = VALUES(flex_dollars_balance),
         last_updated = NOW()`,
      [userId, fundsData.mealPlanBalance || 0, fundsData.flexDollarsBalance || 0]
    );

    res.json({
      status: "success",
      mealPlanBalance: fundsData.mealPlanBalance || 0,
      flexDollarsBalance: fundsData.flexDollarsBalance || 0,
      userId
    });
  } catch (err) {
    console.error("Funds upload error:", err);
    res.status(500).json({ error: "Funds upload failed", message: err.message });
  }
});

// POST funds data (legacy endpoint for manual updates)
app.post("/api/funds", async (req, res) => {
  try {
    const fundsData = req.body;
    const userId = 35; // Default user

    // Save funds data to JSON file
    const fundsPath = path.join(process.cwd(), "data", "fundsData.json");
    const fundsDataToSave = {
      userId,
      mealPlanBalance: fundsData.mealPlanBalance || 0,
      flexDollarsBalance: fundsData.flexDollarsBalance || 0,
      timestamp: fundsData.timestamp || new Date().toISOString()
    };

    fs.writeFileSync(fundsPath, JSON.stringify(fundsDataToSave, null, 2), "utf8");
    console.log(`📊 Funds data saved: Meal Plan: $${fundsDataToSave.mealPlanBalance}, Flex: $${fundsDataToSave.flexDollarsBalance}`);

    res.json({
      status: "success",
      mealPlanBalance: fundsDataToSave.mealPlanBalance,
      flexDollarsBalance: fundsDataToSave.flexDollarsBalance
    });
  } catch (err) {
    console.error("Funds upload error:", err);
    res.status(500).json({ error: "Funds upload failed", message: err.message });
  }
});

// GET funds data - REQUIRES AUTHENTICATION
app.get("/api/funds", authenticateToken, async (req, res) => {
  try {
    const userId = req.userId; // From JWT token

    // Fetch funds data from database for this user
    const [rows] = await pool.query(
      `SELECT meal_plan_balance, flex_dollars_balance, last_updated
       FROM watcard_funds
       WHERE user_id = ?`,
      [userId]
    );

    if (rows.length > 0) {
      res.json({
        mealPlanBalance: parseFloat(rows[0].meal_plan_balance) || 0,
        flexDollarsBalance: parseFloat(rows[0].flex_dollars_balance) || 0,
        timestamp: rows[0].last_updated?.toISOString()
      });
    } else {
      // Return default values if no data exists yet for this user
      res.json({
        mealPlanBalance: 0,
        flexDollarsBalance: 0
      });
    }
  } catch (err) {
    console.error("Funds fetch error:", err);
    res.status(500).json({ error: "Failed to fetch funds", message: err.message });
  }
});

// ============================================================================
// USER SETTINGS ENDPOINTS - Save/Load views, labels, budgets
// ============================================================================

// GET user settings - Load all dashboard settings (views, categories, budgets, labels)
app.get("/api/settings", authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;

    const [rows] = await pool.query(
      `SELECT settings_json FROM user_settings WHERE user_id = ?`,
      [userId]
    );

    if (rows.length > 0) {
      // Parse JSON and return
      const settings = typeof rows[0].settings_json === 'string' 
        ? JSON.parse(rows[0].settings_json) 
        : rows[0].settings_json;
      console.log(`📂 Loaded settings for user ${userId}`);
      res.json(settings);
    } else {
      // Return empty settings if none exist
      console.log(`📂 No settings found for user ${userId}, returning defaults`);
      res.json({
        views: null,
        categories: null,
        budgets: null,
        labels: null,
        selectedViewId: null,
        selectedBudgetId: null,
        displayCurrency: 'CAD'
      });
    }
  } catch (err) {
    console.error("Settings fetch error:", err);
    res.status(500).json({ error: "Failed to fetch settings", message: err.message });
  }
});

// POST user settings - Save all dashboard settings
app.post("/api/settings", authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const settings = req.body;

    console.log(`💾 Saving settings for user ${userId}:`, Object.keys(settings));

    await pool.query(
      `INSERT INTO user_settings (user_id, settings_json, updated_at)
       VALUES (?, ?, NOW())
       ON DUPLICATE KEY UPDATE
         settings_json = VALUES(settings_json),
         updated_at = NOW()`,
      [userId, JSON.stringify(settings)]
    );

    res.json({
      status: "success",
      message: "Settings saved successfully",
      userId
    });
  } catch (err) {
    console.error("Settings save error:", err);
    res.status(500).json({ error: "Failed to save settings", message: err.message });
  }
});

//###################################################################

app.get("/.well-known/appspecific/com.chrome.devtools.json", (req, res) => {
  res.status(404).json({});
});

app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    path: req.path,
    method: req.method
  });
});

const server = app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`✅ Connected to MySQL database: ${process.env.DB_NAME}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is already in use`);
  } else {
    console.error(`❌ Server error:`, err);
  }
  process.exit(1);
});
