# Authentication Backend Setup Guide

## 🎯 Overview
This guide sets up a Node.js/Express backend with MySQL database for user authentication, replacing the localStorage system.

## 📁 Project Structure
```
Project/
├── auth-server/                 # New authentication backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js     # MySQL connection
│   │   │   └── passport.js     # Passport.js config (Google OAuth)
│   │   ├── middleware/
│   │   │   ├── auth.js         # JWT verification middleware
│   │   │   └── validation.js   # Input validation
│   │   ├── routes/
│   │   │   ├── auth.js         # Auth routes (/register, /login, /logout)
│   │   │   ├── user.js         # User management
│   │   │   ├── views.js        # Views CRUD
│   │   │   ├── labels.js       # Labels CRUD
│   │   │   ├── transactions.js # Transactions CRUD
│   │   │   └── budgets.js      # Budgets CRUD
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Transaction.js
│   │   │   └── View.js
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   └── emailService.js
│   │   └── server.js           # Express app entry point
│   ├── .env                     # Environment variables
│   ├── package.json
│   └── README.md
├── database/
│   └── schema-v2-auth.sql      # Database schema (already created)
└── src/                         # Frontend (React app)
```

## 🚀 Step 1: Initialize Backend

```bash
cd Project
mkdir auth-server
cd auth-server
npm init -y
```

## 📦 Step 2: Install Dependencies

```bash
npm install express mysql2 bcrypt jsonwebtoken passport passport-google-oauth20 passport-local express-session dotenv cors helmet express-validator cookie-parser
npm install --save-dev nodemon
```

### Dependency Explanation:
- **express**: Web framework
- **mysql2**: MySQL database driver
- **bcrypt**: Password hashing
- **jsonwebtoken**: JWT token generation
- **passport**: Authentication middleware
- **passport-google-oauth20**: Google OAuth strategy
- **passport-local**: Email/password strategy
- **express-session**: Session management
- **dotenv**: Environment variables
- **cors**: Cross-origin requests
- **helmet**: Security headers
- **express-validator**: Input validation
- **cookie-parser**: Parse cookies

## 🔧 Step 3: Create `.env` File

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=watspend

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Session
SESSION_SECRET=your-super-secret-session-key-change-this
```

## 📝 Step 4: Database Configuration

Create `auth-server/src/config/database.js`:

```javascript
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection
pool.getConnection()
  .then(connection => {
    console.log('✅ MySQL connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('❌ MySQL connection failed:', err.message);
    process.exit(1);
  });

module.exports = pool;
```

## 🔐 Step 5: Authentication Routes

Create `auth-server/src/routes/auth.js`:

```javascript
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const passport = require('passport');

// =====================================================
// REGISTER - Email & Password
// =====================================================
router.post('/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName } = req.body;

    try {
      // Check if user exists
      const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
      if (existing.length > 0) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const [result] = await db.query(
        'INSERT INTO users (email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?)',
        [email, passwordHash, firstName, lastName]
      );

      const userId = result.insertId;

      // Create default settings
      await db.query(
        'INSERT INTO user_settings (user_id, currency, theme) VALUES (?, ?, ?)',
        [userId, 'CAD', 'light']
      );

      // Create default views
      await createDefaultViewsForUser(userId);

      // Generate JWT token
      const token = jwt.sign({ userId, email }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
      });

      res.status(201).json({
        message: 'User created successfully',
        token,
        user: { id: userId, email, firstName, lastName }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
);

// =====================================================
// LOGIN - Email & Password
// =====================================================
router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Find user
      const [users] = await db.query(
        'SELECT id, email, password_hash, first_name, last_name FROM users WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = users[0];

      // Check password
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Update last login
      await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

      // Generate JWT
      const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
      });

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

// =====================================================
// GOOGLE OAUTH - Initiate
// =====================================================
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// =====================================================
// GOOGLE OAUTH - Callback
// =====================================================
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    // Generate JWT
    const token = jwt.sign(
      { userId: req.user.id, email: req.user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

// =====================================================
// LOGOUT
// =====================================================
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// =====================================================
// Helper: Create Default Views
// =====================================================
async function createDefaultViewsForUser(userId) {
  // Create "By Location" view
  const [locationView] = await db.query(
    'INSERT INTO views (user_id, name, type, is_default) VALUES (?, ?, ?, ?)',
    [userId, 'By Location', 'location', true]
  );

  // Create "Meal Plan vs Flex" view
  const [mealplanView] = await db.query(
    'INSERT INTO views (user_id, name, type, is_default) VALUES (?, ?, ?, ?)',
    [userId, 'Meal Plan vs Flex', 'mealplan-flex', true]
  );

  // Create default labels for Meal Plan vs Flex view
  await db.query(
    'INSERT INTO labels (user_id, view_id, name, color, type) VALUES (?, ?, ?, ?, ?)',
    [userId, mealplanView.insertId, 'Meal Plan', '#00D9FF', 'custom']
  );

  await db.query(
    'INSERT INTO labels (user_id, view_id, name, color, type) VALUES (?, ?, ?, ?, ?)',
    [userId, mealplanView.insertId, 'Flex', '#FF1493', 'custom']
  );

  await db.query(
    'INSERT INTO labels (user_id, view_id, name, color, type) VALUES (?, ?, ?, ?, ?)',
    [userId, mealplanView.insertId, 'Other', '#95A5A6', 'custom']
  );

  // Create "Other" label for location view
  await db.query(
    'INSERT INTO labels (user_id, view_id, name, color, type) VALUES (?, ?, ?, ?, ?)',
    [userId, locationView.insertId, 'Other', '#95A5A6', 'custom']
  );
}

module.exports = router;
```

## 🔑 Step 6: JWT Middleware

Create `auth-server/src/middleware/auth.js`:

```javascript
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.user = user; // { userId, email }
    next();
  });
}

module.exports = { authenticateToken };
```

## 🌐 Step 7: Main Server File

Create `auth-server/src/server.js`:

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Auth server is running' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Auth server running on port ${PORT}`);
});
```

## 📝 Step 8: Update package.json

Add scripts to `auth-server/package.json`:

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  }
}
```

## 🧪 Step 9: Test the Backend

```bash
# Start the server
cd auth-server
npm run dev

# Test registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@uwaterloo.ca",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@uwaterloo.ca",
    "password": "password123"
  }'
```

## ✅ Next Steps

1. Set up Google OAuth credentials in Google Cloud Console
2. Create additional API routes for views, labels, transactions
3. Update frontend to use the new auth API
4. Implement data migration from localStorage

---

**This backend will handle all authentication and replace localStorage with MySQL!**
