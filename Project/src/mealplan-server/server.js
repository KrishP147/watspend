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

// GET data
app.get("/api/data", (req, res) => {
  try {
    if (fs.existsSync(dataPath)) {
      const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
      // Ensure data has the correct structure
      if (Array.isArray(data)) {
        // If it's an array (old format), wrap it in snapshot structure
        res.json({
          timestamp: new Date().toISOString(),
          transactionCount: data.length,
          transactions: data,
        });
      } else {
        // Already in correct format
        res.json(data);
      }
    } else {
      // Return empty snapshot structure when no data file exists
      res.json({
        timestamp: new Date().toISOString(),
        transactionCount: 0,
        transactions: [],
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error reading data");
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
app.post("/api/upload", (req, res) => {
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

    // Save merged data
    fs.writeFileSync(dataPath, JSON.stringify(mergedData, null, 2), "utf8");

    const addedCount = uniqueNewTransactions.length;
    const skippedCount = newTransactions.length - addedCount;

    console.log(
      `📝 Upload processed: ${addedCount} new transactions added, ${skippedCount} duplicates skipped. Total: ${mergedTransactions.length}`
    );

    res.json({
      status: "success",
      added: addedCount,
      skipped: skippedCount,
      total: mergedTransactions.length,
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
