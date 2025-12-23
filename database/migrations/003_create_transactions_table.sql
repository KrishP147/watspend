-- Migration: Create transactions table
-- Description: Stores all WatCard transactions (both scraped and manual)
-- Date: 2024

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

