# WatSpend - Frontend Source Code

This directory contains all frontend source code for the WatSpend application.

## Structure

```
src/
├── App.tsx                 # Main application component
├── main.tsx               # React entry point
├── index.html             # HTML template
├── index.css              # Global styles
├── components/            # React components
├── services/              # API services
├── styles/                # Additional stylesheets
├── utils/                 # Utility functions
├── tsconfig.json          # TypeScript configuration
├── tsconfig.node.json     # TypeScript config for Vite
├── vite.config.ts         # Vite build configuration
└── package.json           # Frontend dependencies

└── auth-server/           # ⚠️ NOTE: Should be moved to root level
```

## Backend Services

Backend services (auth-server, mealplan-server) should be located at the project root, not in src/.

## Development

```bash
cd src
npm install
npm run dev
```

Server runs at http://localhost:5173
