-- Quick check script to verify table structure
-- Run: mysql -u lkatsif -p -h riku.shoshin.uwaterloo.ca SE101_Team_10 < Project/database/check_tables.sql

USE SE101_Team_10;

-- Check if tables exist
SHOW TABLES;

-- Check transactions table structure
DESCRIBE transactions;

-- Check if user_id column exists
SHOW COLUMNS FROM transactions LIKE 'user_id';

