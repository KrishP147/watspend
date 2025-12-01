# WatSpend - WatCard Meal Plan Dashboard

> A comprehensive budget tracking and spending visualization tool for University of Waterloo students

**Live App: [https://watspend.vercel.app](https://watspend.vercel.app)**

---

## For End Users (Recommended)

### Step 1: Use the Live App

Go to **[https://watspend.vercel.app](https://watspend.vercel.app)** and sign in with your Google account.

### Step 2: Install the Chrome Extension

1. **Download** the extension: [Download ZIP](https://github.com/KrishP147/watspend/archive/refs/heads/main.zip)
2. **Extract** the ZIP file
3. Open Chrome and go to `chrome://extensions/`
4. Enable **Developer mode** (toggle in top right)
5. Click **Load unpacked**
6. Select the `Project/src/extension` folder from the extracted files
7. The WatSpend icon appears in your toolbar

### Step 3: Import Your Transactions

1. Go to the [WatCard portal](https://watcard.uwaterloo.ca) and log in
2. Navigate to your transaction history
3. Click the WatSpend extension icon
4. Click **"Scrape Transactions"**
5. Return to [watspend.vercel.app](https://watspend.vercel.app) to see your data!

---

## For Developers (Local Setup)

If you want to run WatSpend locally for development:

### Prerequisites

| Requirement | Version | Download |
|-------------|---------|----------|
| Node.js | 18+ | https://nodejs.org |
| npm | 9+ | Included with Node.js |
| Google Chrome | Latest | https://google.com/chrome |

### Step 1: Clone the Repository

```bash
git clone https://gitlab.uwaterloo.ca/se101-f24/project_team_10.git
cd project_team_10/Project
```

### Step 2: Create Google OAuth Credentials

You need your own Google OAuth credentials for local login to work:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Navigate to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth 2.0 Client ID**
5. Configure consent screen if prompted (External, add your email as test user)
6. Select **Web application** as application type
7. Add authorized origins and redirects:
   - **Authorized JavaScript origins**: `http://localhost:5173`
   - **Authorized redirect URIs**: `http://localhost:4000/api/auth/google/callback`
8. Click **Create** and copy your **Client ID** and **Client Secret**

### Step 3: Backend Setup

```bash
cd mealplan-server
npm install
```

Create `mealplan-server/.env`:
```env
PORT=4000
DB_HOST=riku.shoshin.uwaterloo.ca
DB_USER=<your_uwaterloo_db_username>
DB_PASS=<your_uwaterloo_db_password>
DB_NAME=SE101_Team_10
JWT_SECRET=any-random-string-here
SESSION_SECRET=another-random-string-here
GOOGLE_CLIENT_ID=<your_google_client_id_from_step_2>
GOOGLE_CLIENT_SECRET=<your_google_client_secret_from_step_2>
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

Start the server:
```bash
npm start
```

Backend runs at **http://localhost:4000**

### Step 4: Frontend Setup

```bash
cd src
npm install
```

Create `src/.env`:
```env
VITE_API_URL=http://localhost:4000
```

Start the development server:
```bash
npm run dev
```

Frontend runs at **http://localhost:5173**

### Step 5: Chrome Extension Setup

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select the `src/extension` folder
5. The WatSpend icon appears in your toolbar

### Step 6: Test It

1. Open http://localhost:5173 in Chrome
2. Click "Sign in with Google"
3. Go to the WatCard portal and log in
4. Click the WatSpend extension icon
5. Click "Scrape Transactions"
6. Return to the dashboard to see your imported data

---

## Running Tests

```bash
cd tests
pip install -r ../requirements.txt
pytest test_code.py -v
```

---

## Project Structure

```
Project/
├── README.md              ← This file
├── requirements.txt       ← Python dependencies
├── build/                 ← Compiled output (generated)
├── database/              ← Database schema and migrations
├── docs/                  ← Documentation
│   └── user_manual.md     ← End-user guide
├── mealplan-server/       ← Backend API (Node.js/Express)
├── src/                   ← Frontend (React/TypeScript/Vite)
│   └── extension/         ← Chrome extension
└── tests/                 ← Test files
```

---

## Deployment

### Production URLs

| Component | URL |
|-----------|-----|
| Frontend | https://watspend.vercel.app |
| Backend | https://watspend-api.onrender.com |

### Deploy Your Own Instance

#### Frontend (Vercel)

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import repository, set root to `src`
4. Add env: `VITE_API_URL=https://your-backend.onrender.com`
5. Deploy

#### Backend (Render)

1. Go to [render.com](https://render.com) → New Web Service
2. Connect repository, set root to `mealplan-server`
3. Add environment variables (same as local `.env` but with production URLs)
4. Deploy

#### Post-Deployment

1. Update Google OAuth redirect URIs in Google Cloud Console
2. Update `API_BASE_URL` in `src/extension/background.js`
3. Reload the Chrome extension

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Shadcn/ui, Recharts |
| Backend | Node.js, Express, JWT, Google OAuth 2.0 |
| Database | MySQL 8.0 |
| Extension | Chrome Manifest V3 |

---

## Team

| Member | Role |
|--------|------|
| Shiman | Extension Lead |
| Liron | Auth Lead |
| Ava | Frontend Lead |
| Krish | Backend Lead |
| Elaine | Reports Lead |

---

**SE101 Fall 2025 | University of Waterloo**

