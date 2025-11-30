# WatSpend - WatCard Meal Plan Dashboard

> A comprehensive budget tracking and spending visualization tool for University of Waterloo students

**Live App: [https://watspend.vercel.app](https://watspend.vercel.app)**

---

## Quick Start (Deployed Version)

The fastest way to use WatSpend:

1. Visit [https://watspend.vercel.app](https://watspend.vercel.app)
2. Sign in with your Google account
3. Install the Chrome Extension (see [Chrome Extension Setup](#chrome-extension-setup))
4. Import transactions from the WatCard portal

---

## Running Locally from Scratch

### Prerequisites

| Requirement | Version | Download |
|-------------|---------|----------|
| Node.js | 18+ | https://nodejs.org |
| npm | 9+ | Included with Node.js |
| MySQL | 8.0+ | https://mysql.com |
| Python | 3.8+ | https://python.org |
| Google Chrome | Latest | https://google.com/chrome |

### Step 1: Clone the Repository

```bash
git clone https://gitlab.uwaterloo.ca/se101-f24/project_team_10.git
cd project_team_10/Project
```

### Step 2: Database Setup

1. **Connect to MySQL**:
   ```bash
   mysql -h riku.shoshin.uwaterloo.ca -u team10 -p
   ```

2. **Run the schema**:
   ```bash
   mysql -h riku.shoshin.uwaterloo.ca -u team10 -p Project_Team_10 < database/schema.sql
   ```

   See `database/SETUP.md` for detailed database instructions.

### Step 3: Backend Setup

```bash
cd mealplan-server
npm install
```

Create `mealplan-server/.env`:
```env
PORT=4000
DB_HOST=riku.shoshin.uwaterloo.ca
DB_USER=team10
DB_PASS=your_password
DB_NAME=Project_Team_10
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
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

### Step 6: Verify Everything Works

1. Open http://localhost:5173 in Chrome
2. Click "Sign in with Google"
3. Go to the WatCard portal and log in
4. Click the WatSpend extension icon
5. Click "Scrape Transactions"
6. Return to the dashboard to see your imported data

---

## Running Tests

### Python Database Tests

```bash
cd tests
pip install -r ../requirements.txt
pytest test_code.py -v
```

Expected: 21 tests passing

---

## Project Structure

```
Project/
├── README.md              ← This file (setup instructions)
├── requirements.txt       ← Python dependencies
├── build/                 ← Compiled output (generated)
├── database/              ← Database schema and migrations
│   ├── schema.sql
│   ├── seed.sql
│   └── SETUP.md
├── docs/                  ← Documentation
│   ├── user_manual.md     ← End-user guide
│   ├── charter.md
│   ├── user_stories.md
│   ├── domain_model.md
│   ├── use_cases.md
│   ├── test_plan.md
│   └── test_report.md
├── mealplan-server/       ← Backend API (Node.js/Express)
│   ├── server.js
│   ├── auth.js
│   └── package.json
├── src/                   ← Frontend (React/TypeScript/Vite)
│   ├── App.tsx
│   ├── main.tsx
│   ├── package.json
│   ├── components/
│   ├── services/
│   ├── utils/
│   └── extension/         ← Chrome extension
│       ├── manifest.json
│       ├── background.js
│       ├── content.js
│       └── popup.html
└── tests/                 ← Test files
    └── test_code.py
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
3. Add environment variables:
   - `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`
   - `JWT_SECRET`, `SESSION_SECRET`
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`
   - `FRONTEND_URL`, `NODE_ENV=production`
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
| Testing | pytest, Jest |

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

