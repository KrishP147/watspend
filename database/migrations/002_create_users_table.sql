-- Migration: Create users table
-- Description: Creates the users table with all required fields for user authentication and profile management
-- Date: 2024

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
    
    -- Add unique constraint on email to prevent duplicate accounts
    UNIQUE KEY unique_email (email),
    
    -- Add unique constraint on google_id to prevent duplicate Google accounts
    UNIQUE KEY unique_google_id (google_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add index on email for faster lookups during authentication
CREATE INDEX idx_email ON users(email);

-- Add index on google_id for faster lookups during OAuth authentication
CREATE INDEX idx_google_id ON users(google_id);

