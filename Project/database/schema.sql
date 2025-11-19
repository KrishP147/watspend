-- WatCard Dashboard Database Schema
-- This file contains the complete database schema for the application
-- Run migrations in order: 002_create_users_table.sql, 003_create_transactions_table.sql, etc.

-- ============================================================================
-- Users Table
-- ============================================================================
-- Stores user account information including authentication and profile data
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    google_id VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NULL,
    sms_enabled BOOLEAN NULL,
    created_at DATETIME NULL,
    last_login DATETIME NULL,
    
    -- Constraints
    UNIQUE KEY unique_email (email),
    UNIQUE KEY unique_google_id (google_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for performance
CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_google_id ON users(google_id);

-- ============================================================================
-- Transactions Table
-- ============================================================================
-- Stores all WatCard transactions (both scraped and manual)
CREATE TABLE IF NOT EXISTS transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    time TIME NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    vendor VARCHAR(200) NOT NULL,
    location VARCHAR(200) NULL,
    category ENUM('Café', 'ResHalls', 'Laundry', 'W Store', 'Restaurants', 'Other') NOT NULL,
    description TEXT NULL,
    is_manual BOOLEAN DEFAULT FALSE,
    watcard_transaction_id VARCHAR(100) UNIQUE NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key to users table
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Indexes for performance
    INDEX idx_user_id (user_id),
    INDEX idx_date (date),
    INDEX idx_category (category),
    INDEX idx_user_date (user_id, date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Spending Goals Table
-- ============================================================================
-- Stores monthly spending goals per category for each user
CREATE TABLE IF NOT EXISTS spending_goals (
    goal_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category ENUM('Café', 'ResHalls', 'Laundry', 'W Store', 'Restaurants', 'Other') NOT NULL,
    month_year VARCHAR(7) NOT NULL COMMENT 'Format: YYYY-MM',
    goal_amount DECIMAL(10,2) NOT NULL CHECK (goal_amount > 0),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key to users table
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Unique constraint: one goal per user, category, and month
    UNIQUE KEY unique_goal (user_id, category, month_year),
    
    -- Indexes for performance
    INDEX idx_user_id (user_id),
    INDEX idx_month_year (month_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Monthly Reports Table
-- ============================================================================
-- Stores generated monthly spending reports for each user
CREATE TABLE IF NOT EXISTS monthly_reports (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    month_year VARCHAR(7) NOT NULL COMMENT 'Format: YYYY-MM',
    total_spending DECIMAL(10,2) NOT NULL,
    category_breakdown JSON NOT NULL COMMENT 'JSON object with category amounts',
    insights TEXT NULL,
    pdf_path VARCHAR(500) NULL,
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key to users table
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Unique constraint: one report per user per month
    UNIQUE KEY unique_report (user_id, month_year),
    
    -- Indexes for performance
    INDEX idx_user_id (user_id),
    INDEX idx_month_year (month_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
