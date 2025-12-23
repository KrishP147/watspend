-- Sample Test Data for WatCard Dashboard
-- This file contains sample data for testing and development
-- Run after schema.sql: mysql -u root -p watcard_dashboard < database/seed.sql
-- For shared server: mysql -u USERID -p -h riku.shoshin.uwaterloo.ca SE101_Team_10 < Project/database/seed.sql

-- Note: Remove or comment out the USE statement if specifying database in command line
-- USE watcard_dashboard;

-- ============================================================================
-- Sample Users
-- ============================================================================
INSERT INTO users (email, google_id, first_name, last_name, phone_number, sms_enabled, created_at) VALUES
('jsmith@uwaterloo.ca', '123456789', 'John', 'Smith', '+1-519-555-0123', TRUE, NOW()),
('alee@uwaterloo.ca', '987654321', 'Alice', 'Lee', NULL, FALSE, NOW()),
('bchen@uwaterloo.ca', '456789123', 'Bob', 'Chen', '+1-519-555-0456', TRUE, NOW());

-- ============================================================================
-- Sample Transactions (for John Smith, user_id=1)
-- ============================================================================
INSERT INTO transactions (user_id, date, time, amount, vendor, location, category, is_manual, created_at) VALUES
(1, '2025-11-01', '08:30:00', 4.50, 'Tim Hortons', 'SLC', 'Café', FALSE, NOW()),
(1, '2025-11-01', '12:15:00', 12.00, 'V1 Dining Hall', 'V1', 'ResHalls', FALSE, NOW()),
(1, '2025-11-02', '14:20:00', 3.00, 'Laundry Machine', 'REV', 'Laundry', FALSE, NOW()),
(1, '2025-11-02', '16:45:00', 25.50, 'W Store', 'SLC', 'W Store', FALSE, NOW()),
(1, '2025-11-03', '11:30:00', 8.75, 'Williams Coffee', 'DC', 'Café', FALSE, NOW()),
(1, '2025-11-03', '18:00:00', 15.50, 'Subway', 'SLC', 'Restaurants', FALSE, NOW()),
(1, '2025-11-04', '09:00:00', 5.25, 'Starbucks', 'SLC', 'Café', FALSE, NOW()),
(1, '2025-11-04', '19:30:00', 18.00, 'Pizza Pizza', 'DC', 'Restaurants', FALSE, NOW());

-- Sample Transactions (for Alice Lee, user_id=2)
INSERT INTO transactions (user_id, date, time, amount, vendor, location, category, is_manual, created_at) VALUES
(2, '2025-11-01', '07:45:00', 3.50, 'Tim Hortons', 'SLC', 'Café', FALSE, NOW()),
(2, '2025-11-02', '12:00:00', 10.50, 'CMH Dining Hall', 'CMH', 'ResHalls', FALSE, NOW()),
(2, '2025-11-03', '15:00:00', 4.00, 'Laundry Machine', 'V1', 'Laundry', FALSE, NOW());

-- ============================================================================
-- Sample Spending Goals (for John Smith, user_id=1)
-- ============================================================================
INSERT INTO spending_goals (user_id, category, month_year, goal_amount) VALUES
(1, 'Café', '2025-11', 150.00),
(1, 'ResHalls', '2025-11', 500.00),
(1, 'Laundry', '2025-11', 20.00),
(1, 'W Store', '2025-11', 100.00),
(1, 'Restaurants', '2025-11', 200.00);

-- Sample Spending Goals (for Alice Lee, user_id=2)
INSERT INTO spending_goals (user_id, category, month_year, goal_amount) VALUES
(2, 'Café', '2025-11', 100.00),
(2, 'ResHalls', '2025-11', 400.00);

-- ============================================================================
-- Sample Monthly Report (for John Smith, user_id=1, October 2025)
-- ============================================================================
INSERT INTO monthly_reports (user_id, month_year, total_spending, category_breakdown, insights, generated_at) VALUES
(1, '2025-10', 782.25, 
 '{"Café": 125.50, "ResHalls": 450.00, "Laundry": 12.00, "W Store": 85.75, "Restaurants": 89.25, "Other": 19.75}',
 'You spent 15% less than September. Top category: ResHalls ($450). 4 of 5 goals met.',
 NOW());

-- ============================================================================
-- Verification Query
-- ============================================================================
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'Goals', COUNT(*) FROM spending_goals
UNION ALL
SELECT 'Reports', COUNT(*) FROM monthly_reports;

