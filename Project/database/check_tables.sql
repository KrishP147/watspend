-- Quick check script to verify table structure
-- Run: mysql -u db_user -p -h db.example.com watspend < Project/database/check_tables.sql

USE watspend;

-- Check if tables exist
SHOW TABLES;

-- Check transactions table structure
DESCRIBE transactions;

-- Check if user_id column exists
SHOW COLUMNS FROM transactions LIKE 'user_id';

