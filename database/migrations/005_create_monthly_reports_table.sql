-- Migration: Create monthly_reports table
-- Description: Stores generated monthly spending reports for each user
-- Date: 2024

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

