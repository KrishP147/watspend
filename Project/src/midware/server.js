import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

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
    console.log(`📁 Created data directory: ${dataDir}`);
  }
} catch (err) {
  console.error(`❌ Error creating data directory:`, err);
}

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

// POST data (from extension)
app.post("/api/upload", (req, res) => {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(req.body, null, 2), "utf8");
    res.json({ status: "success" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error writing data");
  }
});

// Handle Chrome DevTools discovery endpoint (prevents CSP warning)
app.get("/.well-known/appspecific/com.chrome.devtools.json", (req, res) => {
  res.status(404).json({});
});

// Catch-all route for unknown endpoints (prevents 404 errors)
app.use((req, res) => {
  console.log(`⚠️  Unknown endpoint: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: "Endpoint not found",
    path: req.path,
    method: req.method
  });
});

const server = app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`📡 Ready to accept connections`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is already in use. Please stop the other process or use a different port.`);
    console.error(`💡 Tip: Run 'lsof -ti:4000 | xargs kill -9' to kill processes on port 4000`);
  } else {
    console.error(`❌ Server error:`, err);
  }
  process.exit(1);
});
