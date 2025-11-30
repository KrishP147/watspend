-- ============================================================================
-- User Settings Table
-- ============================================================================
-- Stores user dashboard settings including views, labels/categories, and budgets
CREATE TABLE IF NOT EXISTS user_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    settings_json JSON NOT NULL COMMENT 'JSON object containing views, categories, budgets, labels, and other settings',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign key to users table
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,

    -- Ensure one row per user
    UNIQUE KEY unique_user_settings (user_id),

    -- Index for performance
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
