-- ============================================================================
-- WatCard Funds Table
-- ============================================================================
-- Stores the current meal plan and flex dollar balances for each user
CREATE TABLE IF NOT EXISTS watcard_funds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    meal_plan_balance DECIMAL(10,2) DEFAULT 0.00,
    flex_dollars_balance DECIMAL(10,2) DEFAULT 0.00,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign key to users table
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,

    -- Ensure one row per user
    UNIQUE KEY unique_user_funds (user_id),

    -- Index for performance
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
