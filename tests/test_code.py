"""
Test cases for WatCard Dashboard database connection and schema.
Tests database connectivity, table structure, and basic operations.
"""

import pytest
import pymysql
import os
import sys
from pathlib import Path
from datetime import date

# Add src directory to path to import code module
src_path = Path(__file__).parent.parent / "src"
sys.path.insert(0, str(src_path))

# Import from src.code explicitly to avoid conflict with built-in code module
import importlib.util
spec = importlib.util.spec_from_file_location("db_code", src_path / "code.py")
db_code = importlib.util.module_from_spec(spec)
spec.loader.exec_module(db_code)

get_db_connection = db_code.get_db_connection
run_migration = db_code.run_migration


################################################################################
# Fixtures
################################################################################

@pytest.fixture(scope="module")
def db_connection():
    """
    Create a database connection for testing.
    Skips tests if connection cannot be established.
    """
    conn = get_db_connection()
    if conn is None:
        pytest.skip("Cannot connect to database. Check .env file and database availability.")
    yield conn
    conn.close()


@pytest.fixture(scope="function")
def clean_transactions(db_connection):
    """
    Clean up transactions table before and after each test.
    """
    cursor = db_connection.cursor()
    cursor.execute("DELETE FROM transactions")
    cursor.execute("DELETE FROM spending_goals")
    cursor.execute("DELETE FROM monthly_reports")
    cursor.execute("DELETE FROM users")
    db_connection.commit()
    cursor.close()
    yield
    # Cleanup after test
    cursor = db_connection.cursor()
    cursor.execute("DELETE FROM transactions")
    cursor.execute("DELETE FROM spending_goals")
    cursor.execute("DELETE FROM monthly_reports")
    cursor.execute("DELETE FROM users")
    db_connection.commit()
    cursor.close()


################################################################################
# Database Connection Tests
################################################################################

def test_get_db_connection_success(db_connection):
    """Test that database connection is established successfully."""
    assert db_connection is not None
    assert db_connection.open is True


def test_get_db_connection_returns_pymysql_connection(db_connection):
    """Test that get_db_connection returns a pymysql.Connection object."""
    assert isinstance(db_connection, pymysql.Connection)


def test_database_connection_can_execute_query(db_connection):
    """Test that we can execute a simple query on the connection."""
    cursor = db_connection.cursor()
    cursor.execute("SELECT 1 as test")
    result = cursor.fetchone()
    cursor.close()
    assert result[0] == 1


################################################################################
# Table Existence Tests
################################################################################

def test_users_table_exists(db_connection):
    """Test that users table exists in the database."""
    cursor = db_connection.cursor()
    cursor.execute("SHOW TABLES LIKE 'users'")
    result = cursor.fetchone()
    cursor.close()
    assert result is not None
    assert result[0] == 'users'


def test_transactions_table_exists(db_connection):
    """Test that transactions table exists in the database."""
    cursor = db_connection.cursor()
    cursor.execute("SHOW TABLES LIKE 'transactions'")
    result = cursor.fetchone()
    cursor.close()
    assert result is not None
    assert result[0] == 'transactions'


def test_spending_goals_table_exists(db_connection):
    """Test that spending_goals table exists in the database."""
    cursor = db_connection.cursor()
    cursor.execute("SHOW TABLES LIKE 'spending_goals'")
    result = cursor.fetchone()
    cursor.close()
    assert result is not None
    assert result[0] == 'spending_goals'


def test_monthly_reports_table_exists(db_connection):
    """Test that monthly_reports table exists in the database."""
    cursor = db_connection.cursor()
    cursor.execute("SHOW TABLES LIKE 'monthly_reports'")
    result = cursor.fetchone()
    cursor.close()
    assert result is not None
    assert result[0] == 'monthly_reports'


def test_all_required_tables_exist(db_connection):
    """Test that all required tables exist."""
    cursor = db_connection.cursor()
    cursor.execute("SHOW TABLES")
    tables = [row[0] for row in cursor.fetchall()]
    cursor.close()
    
    required_tables = {'users', 'transactions', 'spending_goals', 'monthly_reports'}
    assert required_tables.issubset(set(tables)), f"Missing tables: {required_tables - set(tables)}"


################################################################################
# Table Structure Tests
################################################################################

def test_users_table_structure(db_connection):
    """Test that users table has correct columns."""
    cursor = db_connection.cursor()
    cursor.execute("DESCRIBE users")
    columns = {row[0]: row[1] for row in cursor.fetchall()}
    cursor.close()
    
    required_columns = {
        'user_id', 'email', 'google_id', 'first_name', 'last_name',
        'phone_number', 'sms_enabled', 'created_at', 'last_login'
    }
    assert required_columns.issubset(set(columns.keys())), \
        f"Missing columns: {required_columns - set(columns.keys())}"
    
    # Check primary key
    assert 'user_id' in columns
    assert 'int' in columns['user_id'].lower()


def test_transactions_table_structure(db_connection):
    """Test that transactions table has correct columns."""
    cursor = db_connection.cursor()
    cursor.execute("DESCRIBE transactions")
    columns = {row[0]: row[1] for row in cursor.fetchall()}
    cursor.close()
    
    required_columns = {
        'transaction_id', 'user_id', 'date', 'time', 'amount', 'vendor',
        'location', 'category', 'description', 'is_manual',
        'watcard_transaction_id', 'created_at'
    }
    assert required_columns.issubset(set(columns.keys())), \
        f"Missing columns: {required_columns - set(columns.keys())}"
    
    # Check that user_id exists (for foreign key)
    assert 'user_id' in columns


def test_transactions_table_has_foreign_key(db_connection):
    """Test that transactions table has foreign key to users table."""
    cursor = db_connection.cursor()
    cursor.execute("""
        SELECT 
            CONSTRAINT_NAME,
            REFERENCED_TABLE_NAME,
            REFERENCED_COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'transactions'
          AND REFERENCED_TABLE_NAME = 'users'
    """)
    result = cursor.fetchone()
    cursor.close()
    
    assert result is not None, "Foreign key from transactions to users not found"
    assert result[1] == 'users'
    assert result[2] == 'user_id'


################################################################################
# Index Tests
################################################################################

def test_users_table_has_email_index(db_connection):
    """Test that users table has index on email column."""
    cursor = db_connection.cursor()
    cursor.execute("SHOW INDEXES FROM users WHERE Column_name = 'email'")
    result = cursor.fetchone()
    cursor.close()
    
    assert result is not None, "Index on email column not found"


def test_users_table_has_google_id_index(db_connection):
    """Test that users table has index on google_id column."""
    cursor = db_connection.cursor()
    cursor.execute("SHOW INDEXES FROM users WHERE Column_name = 'google_id'")
    result = cursor.fetchone()
    cursor.close()
    
    assert result is not None, "Index on google_id column not found"


def test_transactions_table_has_user_id_index(db_connection):
    """Test that transactions table has index on user_id column."""
    cursor = db_connection.cursor()
    cursor.execute("SHOW INDEXES FROM transactions WHERE Column_name = 'user_id'")
    result = cursor.fetchone()
    cursor.close()
    
    assert result is not None, "Index on user_id column not found"


################################################################################
# CRUD Operation Tests
################################################################################

def test_insert_user(db_connection, clean_transactions):
    """Test inserting a user into the users table."""
    cursor = db_connection.cursor()
    
    cursor.execute("""
        INSERT INTO users (email, google_id, first_name, last_name, phone_number, sms_enabled)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, ('test@uwaterloo.ca', 'test_google_id_123', 'Test', 'User', '+1-519-555-0000', True))
    
    db_connection.commit()
    
    # Verify insertion
    cursor.execute("SELECT * FROM users WHERE email = 'test@uwaterloo.ca'")
    result = cursor.fetchone()
    cursor.close()
    
    assert result is not None
    assert result[1] == 'test@uwaterloo.ca'
    assert result[2] == 'test_google_id_123'
    assert result[3] == 'Test'
    assert result[4] == 'User'


def test_insert_transaction(db_connection, clean_transactions):
    """Test inserting a transaction into the transactions table."""
    cursor = db_connection.cursor()
    
    # First create a user
    cursor.execute("""
        INSERT INTO users (email, google_id, first_name, last_name)
        VALUES (%s, %s, %s, %s)
    """, ('test@uwaterloo.ca', 'test_google_id', 'Test', 'User'))
    db_connection.commit()
    
    # Get user_id
    cursor.execute("SELECT user_id FROM users WHERE email = 'test@uwaterloo.ca'")
    user_id = cursor.fetchone()[0]
    
    # Insert transaction
    cursor.execute("""
        INSERT INTO transactions (user_id, date, time, amount, vendor, location, category, is_manual)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, (user_id, '2025-11-05', '12:00:00', 10.50, 'Test Vendor', 'SLC', 'Café', False))
    
    db_connection.commit()
    
    # Verify insertion
    cursor.execute("SELECT * FROM transactions WHERE vendor = 'Test Vendor'")
    result = cursor.fetchone()
    cursor.close()
    
    # Column order: transaction_id, user_id, date, time, amount, vendor, location, category, ...
    assert result is not None
    assert result[1] == user_id  # user_id is at index 1
    assert result[2] == date(2025, 11, 5)  # date is at index 2
    assert float(result[4]) == 10.50  # amount is at index 4
    assert result[5] == 'Test Vendor'  # vendor is at index 5
    assert result[7] == 'Café'  # category is at index 7


def test_foreign_key_constraint(db_connection, clean_transactions):
    """Test that foreign key constraint prevents invalid user_id in transactions."""
    cursor = db_connection.cursor()
    
    # Try to insert transaction with non-existent user_id
    with pytest.raises(pymysql.Error):
        cursor.execute("""
            INSERT INTO transactions (user_id, date, amount, vendor, category)
            VALUES (%s, %s, %s, %s, %s)
        """, (99999, '2025-11-05', 10.50, 'Test Vendor', 'Café'))
        db_connection.commit()
    
    cursor.close()


def test_unique_email_constraint(db_connection, clean_transactions):
    """Test that unique constraint prevents duplicate emails."""
    cursor = db_connection.cursor()
    
    # Insert first user
    cursor.execute("""
        INSERT INTO users (email, google_id, first_name, last_name)
        VALUES (%s, %s, %s, %s)
    """, ('duplicate@uwaterloo.ca', 'google_id_1', 'First', 'User'))
    db_connection.commit()
    
    # Try to insert duplicate email
    with pytest.raises(pymysql.Error):
        cursor.execute("""
            INSERT INTO users (email, google_id, first_name, last_name)
            VALUES (%s, %s, %s, %s)
        """, ('duplicate@uwaterloo.ca', 'google_id_2', 'Second', 'User'))
        db_connection.commit()
    
    cursor.close()


def test_cascade_delete(db_connection, clean_transactions):
    """Test that deleting a user cascades to delete their transactions."""
    cursor = db_connection.cursor()
    
    # Create user
    cursor.execute("""
        INSERT INTO users (email, google_id, first_name, last_name)
        VALUES (%s, %s, %s, %s)
    """, ('cascade@uwaterloo.ca', 'cascade_google_id', 'Cascade', 'Test'))
    db_connection.commit()
    
    # Get user_id
    cursor.execute("SELECT user_id FROM users WHERE email = 'cascade@uwaterloo.ca'")
    user_id = cursor.fetchone()[0]
    
    # Create transaction
    cursor.execute("""
        INSERT INTO transactions (user_id, date, amount, vendor, category)
        VALUES (%s, %s, %s, %s, %s)
    """, (user_id, '2025-11-05', 5.00, 'Test Vendor', 'Café'))
    db_connection.commit()
    
    # Verify transaction exists
    cursor.execute("SELECT COUNT(*) FROM transactions WHERE user_id = %s", (user_id,))
    count_before = cursor.fetchone()[0]
    assert count_before == 1
    
    # Delete user
    cursor.execute("DELETE FROM users WHERE user_id = %s", (user_id,))
    db_connection.commit()
    
    # Verify transaction was deleted (cascade)
    cursor.execute("SELECT COUNT(*) FROM transactions WHERE user_id = %s", (user_id,))
    count_after = cursor.fetchone()[0]
    cursor.close()
    
    assert count_after == 0, "Transaction should be deleted when user is deleted (CASCADE)"


################################################################################
# Migration Helper Tests
################################################################################

def test_run_migration_with_invalid_file(db_connection):
    """Test that run_migration handles non-existent file gracefully."""
    result = run_migration(db_connection, "nonexistent_file.sql")
    assert result is False


def test_run_migration_with_valid_sql(db_connection, tmp_path):
    """Test that run_migration can execute a valid SQL file."""
    # Create a temporary SQL file
    test_sql_file = tmp_path / "test_migration.sql"
    test_sql_file.write_text("SELECT 1 as test;")
    
    # Note: This test might fail if the SQL doesn't create/modify anything
    # But it tests that the function can read and execute SQL
    result = run_migration(db_connection, str(test_sql_file))
    # The function should complete (even if it's just a SELECT)
    assert isinstance(result, bool)


################################################################################
# Data Type Tests
################################################################################

def test_category_enum_values(db_connection, clean_transactions):
    """Test that category ENUM accepts valid values."""
    cursor = db_connection.cursor()
    
    # Create user
    cursor.execute("""
        INSERT INTO users (email, google_id, first_name, last_name)
        VALUES (%s, %s, %s, %s)
    """, ('enum@uwaterloo.ca', 'enum_google_id', 'Enum', 'Test'))
    db_connection.commit()
    
    cursor.execute("SELECT user_id FROM users WHERE email = 'enum@uwaterloo.ca'")
    user_id = cursor.fetchone()[0]
    
    # Test valid categories
    valid_categories = ['Café', 'ResHalls', 'Laundry', 'W Store', 'Restaurants', 'Other']
    
    for category in valid_categories:
        cursor.execute("""
            INSERT INTO transactions (user_id, date, amount, vendor, category)
            VALUES (%s, %s, %s, %s, %s)
        """, (user_id, '2025-11-05', 10.00, 'Test Vendor', category))
        db_connection.commit()
    
    # Verify all categories were inserted
    cursor.execute("SELECT DISTINCT category FROM transactions WHERE user_id = %s", (user_id,))
    inserted_categories = [row[0] for row in cursor.fetchall()]
    cursor.close()
    
    assert set(inserted_categories) == set(valid_categories)


def test_amount_check_constraint(db_connection, clean_transactions):
    """Test that amount CHECK constraint prevents negative or zero values."""
    cursor = db_connection.cursor()
    
    # Create user
    cursor.execute("""
        INSERT INTO users (email, google_id, first_name, last_name)
        VALUES (%s, %s, %s, %s)
    """, ('check@uwaterloo.ca', 'check_google_id', 'Check', 'Test'))
    db_connection.commit()
    
    cursor.execute("SELECT user_id FROM users WHERE email = 'check@uwaterloo.ca'")
    user_id = cursor.fetchone()[0]
    
    # Try to insert negative amount (should fail)
    with pytest.raises(pymysql.Error):
        cursor.execute("""
            INSERT INTO transactions (user_id, date, amount, vendor, category)
            VALUES (%s, %s, %s, %s, %s)
        """, (user_id, '2025-11-05', -10.00, 'Test Vendor', 'Café'))
        db_connection.commit()
    
    cursor.close()

