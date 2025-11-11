-- Migration: Create spending_goals table
-- Description: Stores monthly spending goals per category for each user
-- Date: 2024

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

