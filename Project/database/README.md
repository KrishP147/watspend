# Database Setup Guide

This directory contains all database-related files for the WatCard Dashboard project.

## 📁 Files

- **`schema.sql`** - Complete database schema (all tables in one file)
- **`seed.sql`** - Sample test data for development
- **`migrations/`** - Individual migration files (run in order)

## 🚀 Quick Setup

### Option A: Local MySQL Setup (Recommended for Development)

#### Step 0: Install MySQL 8.x

**macOS:**
```bash
# Using Homebrew
brew install mysql@8.0

# Start MySQL service
brew services start mysql@8.0

# Secure the installation (set root password)
mysql_secure_installation
```

**Windows:**
1. Download MySQL 8.x installer from [https://dev.mysql.com/downloads/installer/](https://dev.mysql.com/downloads/installer/)
2. Run the installer and select "Developer Default" or "Server only"
3. Follow the setup wizard:
   - Choose "Standalone MySQL Server"
   - Set a root password (remember this!)
   - Configure MySQL to run as a Windows service
4. Verify installation:
```cmd
mysql --version
```

**Linux (Ubuntu/Debian):**
```bash
# Update package list
sudo apt update

# Install MySQL 8.x
sudo apt install mysql-server

# Start MySQL service
sudo systemctl start mysql
sudo systemctl enable mysql

# Secure the installation
sudo mysql_secure_installation
```

**Verify Installation:**
```bash
# Check MySQL version (should be 8.x)
mysql --version

# Login to MySQL
mysql -u root -p
```

#### Step 1: Create Database

**For Local MySQL:**
```bash
# Login to MySQL
mysql -u root -p

# Create the database
CREATE DATABASE watcard_dashboard;

# Exit MySQL
EXIT;
```

### Option B: UW SE101 Shared Server Setup

If you're using the UW SE101 shared MySQL server (`riku.shoshin.uwaterloo.ca`), you likely **cannot create databases**. Instead:

#### Step 1: Check Available Databases

```bash
# Login to shared server
mysql -u YOUR_USERID -p -h riku.shoshin.uwaterloo.ca

# List databases you can access
SHOW DATABASES;

# You'll probably see something like:
# - SE101_Team_10 (your team's database)
# - information_schema
# - mysql
```

#### Step 2: Use Existing Database

```bash
# Use your team's existing database
USE SE101_Team_10;

# Or if you have a different database name, use that
# USE your_database_name;
```

**Note:** You don't need to create a new database - just use the one you have access to!

### Step 2: Run Schema

**For Local MySQL:**
```bash
# Option A: Run complete schema (recommended)
mysql -u root -p watcard_dashboard < database/schema.sql

# Option B: Run migrations individually
mysql -u root -p watcard_dashboard < database/migrations/002_create_users_table.sql
mysql -u root -p watcard_dashboard < database/migrations/003_create_transactions_table.sql
mysql -u root -p watcard_dashboard < database/migrations/004_create_spending_goals_table.sql
mysql -u root -p watcard_dashboard < database/migrations/005_create_monthly_reports_table.sql
```

**For Shared Server:**
```bash
# Option 1: Run from command line (recommended - easiest)
# Make sure you're in the project root directory first
mysql -u YOUR_USERID -p -h riku.shoshin.uwaterloo.ca SE101_Team_10 < Project/database/schema.sql

# Option 2: Run from within MySQL using SOURCE
# First, login to MySQL:
mysql -u YOUR_USERID -p -h riku.shoshin.uwaterloo.ca

# Then inside MySQL:
mysql> USE SE101_Team_10;
mysql> SOURCE /Users/YOUR_USERNAME/Desktop/SWE/UW_SE/SE101/project_team_10/Project/database/schema.sql;
# Or use relative path from home:
mysql> SOURCE ~/Desktop/SWE/UW_SE/SE101/project_team_10/Project/database/schema.sql;
```

### Step 3: Load Sample Data (Optional)

```bash
# For Local MySQL:
mysql -u root -p watcard_dashboard < database/seed.sql

# For Shared Server:
mysql -u YOUR_USERID -p -h riku.shoshin.uwaterloo.ca SE101_Team_10 < Project/database/seed.sql
```

### Step 4: Verify Setup

```bash
# For Local MySQL:
mysql -u root -p watcard_dashboard

# For Shared Server:
mysql -u YOUR_USERID -p -h riku.shoshin.uwaterloo.ca

# Select database (if using shared server)
USE SE101_Team_10

# Check tables
SHOW TABLES;

# Check users
SELECT * FROM users;

# Check transactions
SELECT * FROM transactions;

# Exit
EXIT;
```

## 📊 Database Structure

### Tables

1. **`users`** - User accounts and authentication
2. **`transactions`** - WatCard transactions (scraped and manual)
3. **`spending_goals`** - Monthly spending goals per category
4. **`monthly_reports`** - Generated monthly spending reports

### Key Concepts

- **One Shared Database**: All users share the same database
- **User Separation**: Data is separated by `user_id` foreign keys
- **Cascade Delete**: Deleting a user automatically deletes all their data

## 🔧 Configuration

Create a `.env` file in the project root:

**For Local MySQL:**
```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_DATABASE=watcard_dashboard
```

**For UW SE101 Shared Server:**
```bash
DB_HOST=riku.shoshin.uwaterloo.ca
DB_USER=your_userid
DB_PASSWORD=your_password
DB_DATABASE=SE101_Team_10
```

## 🧪 Testing

After setup, you can test the connection using Python:

```python
from src.code import get_db_connection

conn = get_db_connection()
if conn:
    print("✓ Database connection successful!")
    conn.close()
else:
    print("✗ Database connection failed")
```

## 📝 Notes

- Each team member should set up MySQL locally
- Everyone uses the same schema, but different local data
- The database name is `watcard_dashboard` (not per-user databases)
- User data is separated by `user_id` in queries

## 🐛 Troubleshooting

**Error: "Access denied for user 'xxx'@'%' to database 'watcard_dashboard'"**
- **On shared server:** You don't have permission to create databases
- **Solution:** Use an existing database you have access to (e.g., `SE101_Team_10`)
- Check available databases: `SHOW DATABASES;` after logging in
- Update your `.env` file to use the existing database name

**Error: "Access denied" (login)**
- Check your MySQL username and password
- For local MySQL: Make sure MySQL service is running: `brew services list` (Mac) or `sudo systemctl status mysql` (Linux)

**Error: "Database doesn't exist"**
- **Local:** Make sure you created the database: `CREATE DATABASE watcard_dashboard;`
- **Shared server:** Use an existing database (you can't create new ones)

**Error: "Table already exists"**
- This is okay! The schema uses `CREATE TABLE IF NOT EXISTS`
- You can safely re-run the schema file

**Error: "Foreign key constraint fails"**
- Make sure you run migrations in order (002, 003, 004, 005)
- Or use the complete `schema.sql` file

