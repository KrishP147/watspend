-- =====================================================
-- WatSpend V2 Database Schema
-- Complete Authentication & View-Based System
-- =====================================================

-- =====================================================
-- USERS & AUTHENTICATION
-- =====================================================

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- NULL for OAuth-only users
    google_id VARCHAR(255) UNIQUE, -- Google OAuth ID
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_google_id (google_id)
);

-- =====================================================
-- USER SETTINGS & PREFERENCES
-- =====================================================

CREATE TABLE user_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    currency VARCHAR(10) DEFAULT 'CAD',
    theme ENUM('light', 'dark') DEFAULT 'light',
    initial_balance DECIMAL(10, 2) DEFAULT 1000.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_settings (user_id)
);

-- =====================================================
-- VIEWS SYSTEM (Core of the app)
-- =====================================================

CREATE TABLE views (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    type ENUM('location', 'mealplan-flex', 'custom') NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_view_name_per_user (user_id, name),
    INDEX idx_user_views (user_id)
);

-- =====================================================
-- LABELS (formerly categories)
-- =====================================================

CREATE TABLE labels (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    view_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) NOT NULL, -- Hex color code #RRGGBB
    type ENUM('location', 'flex', 'custom') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (view_id) REFERENCES views(id) ON DELETE CASCADE,
    UNIQUE KEY unique_label_per_view (view_id, name),
    INDEX idx_user_labels (user_id),
    INDEX idx_view_labels (view_id)
);

-- =====================================================
-- TRANSACTIONS
-- =====================================================

CREATE TABLE transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    external_id VARCHAR(255), -- WatCard transaction ID (for scraped data)
    amount DECIMAL(10, 2) NOT NULL,
    date DATE NOT NULL,
    time TIME,
    type ENUM('expense', 'income') DEFAULT 'expense',
    source ENUM('watcard', 'manual') DEFAULT 'watcard',
    note TEXT,
    terminal VARCHAR(255), -- WatCard terminal info
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_external_transaction (user_id, external_id),
    INDEX idx_user_transactions (user_id),
    INDEX idx_transaction_date (date),
    INDEX idx_external_id (external_id)
);

-- =====================================================
-- TRANSACTION-LABEL ASSIGNMENTS (Per View)
-- =====================================================

CREATE TABLE transaction_label_assignments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    transaction_id INT NOT NULL,
    view_id INT NOT NULL,
    label_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (view_id) REFERENCES views(id) ON DELETE CASCADE,
    FOREIGN KEY (label_id) REFERENCES labels(id) ON DELETE CASCADE,
    UNIQUE KEY unique_transaction_view_assignment (transaction_id, view_id),
    INDEX idx_transaction_assignments (transaction_id),
    INDEX idx_view_assignments (view_id),
    INDEX idx_label_assignments (label_id)
);

-- =====================================================
-- BUDGETS SYSTEM
-- =====================================================

CREATE TABLE budgets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    view_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    type ENUM('mealplan', 'flex') NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    period ENUM('day', 'week', 'month', 'year') NOT NULL,
    end_date DATE, -- For dynamic budgets
    is_dynamic BOOLEAN DEFAULT FALSE, -- Recalculates daily
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (view_id) REFERENCES views(id) ON DELETE CASCADE,
    INDEX idx_user_budgets (user_id),
    INDEX idx_view_budgets (view_id)
);

-- =====================================================
-- WATCARD FUNDS DATA (Current balances)
-- =====================================================

CREATE TABLE watcard_funds (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    meal_plan_balance DECIMAL(10, 2) DEFAULT 0.00,
    flex_dollars_balance DECIMAL(10, 2) DEFAULT 0.00,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_funds (user_id)
);

-- =====================================================
-- SESSION MANAGEMENT (For authentication)
-- =====================================================

CREATE TABLE sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_session_token (session_token),
    INDEX idx_user_sessions (user_id)
);

-- =====================================================
-- OAUTH TOKENS (For Google OAuth refresh tokens)
-- =====================================================

CREATE TABLE oauth_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    provider ENUM('google') NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_provider (user_id, provider)
);
