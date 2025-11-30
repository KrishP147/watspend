# WatSpend - WatCard Meal Plan Dashboard

> 💰 A comprehensive budget tracking and spending visualization tool for University of Waterloo students

**🚀 Live Demo: [https://watspend.vercel.app](https://watspend.vercel.app)**

[![Version](https://img.shields.io/badge/version-1.0-blue.svg)](https://gitlab.uwaterloo.ca)
[![Node](https://img.shields.io/badge/node-18%2B-brightgreen.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/react-18-61dafb.svg)](https://reactjs.org)
[![Deployed](https://img.shields.io/badge/deployed-vercel-black.svg)](https://watspend.vercel.app)

---

## ��� Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Usage Guide](#usage-guide)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Documentation](#documentation)
- [Team](#team)

---

## Overview

WatSpend is a web-based application that helps University of Waterloo students track and analyze their WatCard spending. The system consists of:

1. **Chrome Extension** - Automatically scrapes transaction data from the WatCard portal
2. **React Dashboard** - Visualizes spending patterns with interactive charts
3. **Node.js Backend** - Handles authentication, data storage, and API endpoints
4. **MySQL Database** - Stores user accounts, transactions, budgets, and reports

### Key Benefits

- ��� **Visual Insights**: See where your money goes with interactive charts
- ��� **Budget Tracking**: Set static or dynamic budgets with label allocations
- ��� **Auto-Import**: Chrome extension scrapes transactions automatically
- ���️ **Smart Labels**: Organize by location or Meal Plan vs Flex
- ��� **Modern UI**: Dark mode support and responsive design
- ��� **Secure**: Google OAuth and JWT authentication

---

## Features

### ✅ Core Features

| Feature | Description | Status |
|---------|-------------|--------|
| **User Authentication** | Google OAuth + Email/Password login | ✅ Complete |
| **Transaction Import** | Chrome extension auto-scrapes WatCard | ✅ Complete |
| **Dashboard Overview** | 6 balance cards, charts, spending breakdown | ✅ Complete |
| **Budget System** | Static and dynamic budgets with label allocations | ✅ Complete |
| **View System** | By Location / Meal Plan vs Flex views | ✅ Complete |
| **Transaction Management** | Add, edit, search, filter transactions | ✅ Complete |
| **Monthly Reports** | Period comparisons and trend analysis | ✅ Complete |
| **CSV Export** | Export transactions with filters | ✅ Complete |
| **Dark Mode** | Full dark theme support | ✅ Complete |
| **Currency Support** | 9 currencies with live conversion | ✅ Complete |

### ��� Budget Features

- **Static Budgets**: Fixed amount per day/week/month/year
- **Dynamic Budgets**: Auto-calculate based on remaining balance and end date
- **Label Allocations**: Assign budget portions to specific categories
- **Progress Tracking**: Visual progress bars with over-budget warnings
- **Budget Scaling**: View budget amounts scaled to any time range

### ���️ Label System

- **By Location View**: Auto-generated labels from terminal IDs (e.g., SLC, DC, V1)
- **Meal Plan vs Flex View**: Categorize by account type
- **Multi-View Support**: Different labels per view
- **Budget Type Filtering**: Labels greyed out based on budget type

---

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development builds
- **Tailwind CSS** for styling
- **Shadcn/ui** component library
- **Recharts** for data visualization

### Backend
- **Node.js** with Express
- **MySQL 8.0** database
- **JWT** for authentication
- **Google OAuth 2.0**

### Extension
- **Chrome Manifest V3**
- **Content Scripts** for DOM scraping
- **Background Service Worker**

### Testing
- **pytest** for database tests
- **Jest** for JavaScript tests
- **React Testing Library**

---

## Project Structure

\`\`\`
.
├── README.md                  ← This file (setup + overview)
├── IMPLEMENTATION_STATUS.md   ← Feature completion status
├── requirements.txt           ← Python dependencies
│
├── docs/                      ← All documentation
│   ├── charter.md            ← Project charter
│   ├── user_stories.md       ← User stories
│   ├── domain_model.md       ← Database design
│   ├── use_cases.md          ← Use case specifications
│   ├── test_plan.md          ← Testing strategy
│   ├── test_report.md        ← Test execution results
│   ├── user_manual.md        ← End-user guide
│   ├── sprint_retrospectives.md
│   ├── review_presentation.pdf
│   └── demo.mp4              ← Final demo video
│
├── src/                       ← Frontend React application
│   ├── App.tsx               ← Main app component
│   ├── main.tsx              ← Entry point
│   ├── package.json          ← Frontend dependencies
│   ├── vite.config.ts        ← Build configuration
│   ├── components/           ← React components
│   │   ├── dashboard-overview.tsx
│   │   ├── monthly-report.tsx
│   │   ├── transaction-manager.tsx
│   │   ├── budget-creator.tsx
│   │   ├── settings.tsx
│   │   └── ui/               ← Shadcn UI components
│   ├── services/             ← API services
│   ├── utils/                ← Utility functions
│   │   ├── budgetCalculations.ts
│   │   ├── currency.ts
│   │   └── exportCSV.ts
│   ├── styles/               ← Global styles
│   └── extension/            ← Chrome extension
│       ├── manifest.json
│       ├── background.js
│       ├── content.js
│       ├── popup.html
│       └── popup.js
│
├── mealplan-server/           ← Backend API server
│   ├── server.js             ← Express server
│   ├── auth.js               ← JWT authentication
│   └── package.json
│
├── database/                  ← Database setup
│   ├── schema.sql            ← Table definitions
│   ├── seed.sql              ← Sample data
│   ├── SETUP.md              ← Setup instructions
│   └── migrations/           ← Schema migrations
│
├── tests/                     ← Test files
│   └── test_code.py          ← Python database tests
│
└── build/                     ← Compiled output (generated)
\`\`\`

---

## Quick Start (Live Version)

The easiest way to use WatSpend is through our deployed version:

1. **Visit** [https://watspend.vercel.app](https://watspend.vercel.app)
2. **Sign in** with your Google account
3. **Install the Chrome Extension** (see below)
4. **Import your transactions** from the WatCard portal

### Installing the Chrome Extension

1. Download/clone this repository
2. Open Chrome → `chrome://extensions/`
3. Enable **Developer mode** (top right toggle)
4. Click **Load unpacked** → Select `src/extension` folder
5. The WatSpend icon appears in your toolbar
6. Visit [WatCard portal](https://watcard.uwaterloo.ca), click the extension, and scrape!

---

## Local Development Setup

If you want to run WatSpend locally for development:

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.8+ (for database tests)
- **MySQL** 8.0+
- **Google Chrome** (for extension)

### 1. Clone the Repository

\`\`\`bash
git clone https://gitlab.uwaterloo.ca/se101-f24/project_team_10.git
cd project_team_10/Project
\`\`\`

### 2. Database Setup

1. Connect to the MySQL server:
   \`\`\`bash
   mysql -h riku.shoshin.uwaterloo.ca -u team10 -p
   \`\`\`

2. Run the schema migrations:
   \`\`\`bash
   cd database
   mysql -h riku.shoshin.uwaterloo.ca -u team10 -p Project_Team_10 < schema.sql
   \`\`\`

See \`database/SETUP.md\` for detailed instructions.

### 3. Backend Setup

\`\`\`bash
cd mealplan-server
npm install
\`\`\`

Create a \`.env\` file:
\`\`\`env
PORT=4000
DB_HOST=riku.shoshin.uwaterloo.ca
DB_USER=team10
DB_PASSWORD=your_password
DB_NAME=Project_Team_10
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
\`\`\`

Start the server:
\`\`\`bash
npm start
\`\`\`

Backend runs at **http://localhost:4000**

### 4. Frontend Setup

\`\`\`bash
cd src
npm install
npm run dev
\`\`\`

Frontend runs at **http://localhost:5173**

### 5. Chrome Extension Setup

1. Open Chrome and navigate to \`chrome://extensions/\`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select the \`src/extension\` folder
5. The WatSpend icon appears in your toolbar

---

## Deployment

### Live Production URLs

| Component | URL |
|-----------|-----|
| **Frontend** | [https://watspend.vercel.app](https://watspend.vercel.app) |
| **Backend API** | [https://watspend-api.onrender.com](https://watspend-api.onrender.com) |

### Deploying Your Own Instance

#### Frontend - Vercel

1. Fork/push your repository to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click **"New Project"** → Import your repository
4. Configure the project:
   - **Root Directory**: \`src\`
   - **Framework Preset**: Vite
   - **Build Command**: \`npm run build\`
   - **Output Directory**: \`build\`
5. Add environment variable:
   \`\`\`
   VITE_API_URL=https://your-render-app.onrender.com
   \`\`\`
6. Click **Deploy**

### Backend - Render

1. Go to [render.com](https://render.com) and sign in
2. Click **"New"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: \`watspend-api\`
   - **Root Directory**: \`mealplan-server\`
   - **Runtime**: Node
   - **Build Command**: \`npm install\`
   - **Start Command**: \`npm start\`
5. Add environment variables:

   | Variable | Value |
   |----------|-------|
   | \`DB_HOST\` | \`riku.shoshin.uwaterloo.ca\` |
   | \`DB_USER\` | Your MySQL username |
   | \`DB_PASS\` | Your MySQL password |
   | \`DB_NAME\` | \`Project_Team_10\` |
   | \`JWT_SECRET\` | Generate a secure random string |
   | \`SESSION_SECRET\` | Generate a secure random string |
   | \`GOOGLE_CLIENT_ID\` | From Google Cloud Console |
   | \`GOOGLE_CLIENT_SECRET\` | From Google Cloud Console |
   | \`GOOGLE_CALLBACK_URL\` | \`https://your-app.onrender.com/api/auth/google/callback\` |
   | \`FRONTEND_URL\` | \`https://your-app.vercel.app\` |
   | \`NODE_ENV\` | \`production\` |

6. Click **Deploy**

### Post-Deployment Steps

1. **Update Google OAuth**: Add your Render callback URL to Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client IDs → Authorized redirect URIs

2. **Update Chrome Extension**: Edit \`src/extension/background.js\`:
   \`\`\`javascript
   const API_BASE_URL = "https://your-render-app.onrender.com";
   \`\`\`
   Then reload the extension in Chrome.

3. **Test the deployment**: Visit your Vercel URL and verify login works.

### Free Tier Notes

- **Render Free Tier**: Spins down after 15 minutes of inactivity. First request may take 30-60 seconds.
- **Vercel Free Tier**: Generous limits for hobby projects. No spin-down issues.

---

## Usage Guide

### Quick Start

1. **Login**: Click "Sign in with Google" with your @uwaterloo.ca account
2. **Import Transactions**: 
   - Log into WatCard portal
   - Click the WatSpend extension icon
   - Click "Scrape Transactions"
3. **View Dashboard**: See your spending overview with charts
4. **Create Budget**: Go to Goals → Create Budget
5. **Track Progress**: Monitor spending against your budget

### Detailed Guide

See \`docs/user_manual.md\` for the complete user manual.

---

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | \`/api/auth/register\` | Register with email/password |
| POST | \`/api/auth/login\` | Login with email/password |
| POST | \`/api/auth/google\` | Google OAuth callback |
| GET | \`/api/auth/me\` | Get current user |

### Transaction Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/api/transactions\` | Get user's transactions |
| POST | \`/api/transactions\` | Add manual transaction |
| PUT | \`/api/transactions/:id\` | Update transaction |
| DELETE | \`/api/transactions/:id\` | Delete transaction |
| POST | \`/api/transactions/import\` | Bulk import from extension |

---

## Testing

### Run Python Database Tests

\`\`\`bash
cd tests
pip install -r ../requirements.txt
pytest test_code.py -v
\`\`\`

### Expected Results

- **21 database tests**: Connection, table structure, CRUD operations
- **All tests should pass** with proper database configuration

### Test Coverage

| Component | Coverage |
|-----------|----------|
| Frontend | ~77% |
| Backend | ~75% |
| Database | ~90% |

See \`docs/test_report.md\` for detailed test results.

---

## Documentation

| Document | Path | Description |
|----------|------|-------------|
| Project Charter | \`docs/charter.md\` | Scope, team roles, timeline |
| User Stories | \`docs/user_stories.md\` | Feature requirements |
| Domain Model | \`docs/domain_model.md\` | Database design |
| Use Cases | \`docs/use_cases.md\` | Detailed workflows |
| Test Plan | \`docs/test_plan.md\` | Testing strategy |
| Test Report | \`docs/test_report.md\` | Test execution results |
| User Manual | \`docs/user_manual.md\` | End-user guide |
| Sprint Retrospectives | \`docs/sprint_retrospectives.md\` | Sprint reflections |

---

## Team

| Member | Role | Responsibilities |
|--------|------|------------------|
| **Shiman** | Extension Lead | Chrome extension, data scraping, pipeline |
| **Liron** | Auth Lead | Google OAuth, JWT, SMS integration |
| **Ava** | Frontend Lead | UI/UX design, progress bars, testing |
| **Krish** | Backend Lead | MySQL, GitLab workflow, documentation |
| **Elaine** | Reports Lead | Monthly summaries, demo video, documentation |

---

## GitLab Setup

Use Issue Boards under **Plan > Issue boards**:
- One board: **Product Backlog** (label: backlog)
- One board per sprint: **Sprint 1**, **Sprint 2**, etc. (use Milestones or Iterations)

Label issues: \`type::story\`, \`type::bug\`, \`priority::high\`, \`sprint::1\`, etc.

Tag final release:
\`\`\`bash
git tag v1.0 && git push origin v1.0
\`\`\`

---

**Made by Team 10 | SE101 Fall 2025 | University of Waterloo**
