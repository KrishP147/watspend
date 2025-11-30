# WatCard Meal Plan Dashboard

A web-based financial dashboard and Chrome extension that helps University of Waterloo students track and analyze WatCard spending. The system scrapes spending data from the WatCard website, stores it in a local database, and visualizes trends, balances, and monthly summaries.

---

## Features

- **Secure Chrome Extension** for WatCard transaction scraping  
- **Interactive dashboard** with categorized spending, goal tracking, and trends  
- **Local MySQL database** for structured storage  
- **Manual expense logging** and customizable categories  
- **Monthly automated summary reports**   

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React (JavaScript), HTML/CSS |
| Backend | Express.js (Node.js) |
| Database | MySQL |
| Chrome Extension | JavaScript, Chrome API |
| Visualization | Chart.js / D3.js |
| Version Control | Git (GitLab) |

---

## Prerequisites

Before setup, ensure you have the following installed:

- **Node.js v18+** → https://nodejs.org  
- **MySQL v8+** → https://www.mysql.com  
- **Git (GitLab access configured)**  
- **Chrome browser**

---

## 🚀 How to Run This Project

### Step 1: Database Setup

1. **Start MySQL** (if not already running):
   ```bash
   # MySQL should auto-start on Windows
   # Check if it's running in Services app
   ```

2. **Create Database** (use your MySQL root password):
   ```bash
   mysql -u root -p
   # Enter your password when prompted
   ```

   Then in MySQL:
   ```sql
   CREATE DATABASE watcard_dashboard;
   EXIT;
   ```

3. **Load Database Schema**:
   ```bash
   # From project root (project_team_10)
   mysql -u root -p watcard_dashboard < Project/database/schema.sql

   # Optional: Load sample data
   mysql -u root -p watcard_dashboard < Project/database/seed.sql
   ```

### Step 2: Configure Environment Variables

1. **Edit Project/.env** - Add your MySQL password:
   ```
   DB_PASSWORD=your_actual_mysql_password
   ```

2. **Edit Project/src/mealplan-server/.env** - Add your MySQL password:
   ```
   DB_PASS=your_actual_mysql_password
   ```

### Step 3: Run the Application

Open **3 separate terminals**:

**Terminal 1 - Backend Server** (Port 4000):
```bash
cd Project/src/mealplan-server
npm start
```

**Terminal 2 - Frontend Dev Server** (Port 5173):
```bash
cd Project/src
npm run dev
```

**Terminal 3 - Python Backend** (for database operations):
```bash
cd Project
python
>>> from src.code import get_db_connection
>>> conn = get_db_connection()
# Should see: Connected to database watcard_dashboard
```

### Step 4: Load Chrome Extension

1. Open Chrome → `chrome://extensions/`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select folder: `Project/src/extension`
5. Extension should appear as "MealPlan Dashboard Scraper"

### Step 5: Access the Application

- **Frontend Dashboard**: http://localhost:5173
- **Backend API**: http://localhost:4000
- **Chrome Extension**: Click the extension icon when on WatCard website

---

## 📂 Directory Structure

```bash
Project/
├── src/
│   ├── extension/              # Chrome scraping extension
│   ├── mealplan-server/        # Express.js backend (Node)
│   ├── src/                    # React frontend components
│   ├── code.py                 # Python database utilities
│   ├── package.json            # Frontend dependencies
│   └── vite.config.ts          # Vite config
├── database/                   # MySQL schemas & migrations
├── docs/                       # Documentation
├── tests/                      # Python tests
├── requirements.txt            # Python dependencies
└── .env                        # Database config

