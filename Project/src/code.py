import pymysql
import os
from dotenv import load_dotenv
from datetime import datetime, date, timedelta
import logging

################################################################################
# Logging Configuration
################################################################################

def configureLogging():
    if not logging.getLogger().hasHandlers():
        logging.basicConfig(
            filename="watcard.log",
            filemode="a",
            level=logging.DEBUG,
            format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
        )

configureLogging()
logger = logging.getLogger("watcard")

# Load environment variables from .env file
load_dotenv()

################################################################################
# Database Connection
################################################################################

def get_db_connection():
    """
    Get database connection from environment variables (.env file).
    
    Returns:
        pymysql.Connection object if successful, None otherwise
    """
    try:
        connection = pymysql.connect(
            host=os.getenv("DB_HOST"),
            user=os.getenv("DB_USER"),
            database=os.getenv("DB_DATABASE"),
            password=os.getenv("DB_PASSWORD")
        )
        logger.info(f"Connected to database {os.getenv('DB_DATABASE')}")
        return connection
    except pymysql.Error as err:
        logger.error(f"Database connection error: {err}")
        print(f"Error: {err}")
        return None

################################################################################
# Database Migration Helper
################################################################################

def run_migration(connection, migration_file_path):
    """
    Execute a SQL migration file.
    
    Args:
        connection: MySQL database connection
        migration_file_path: Path to the SQL migration file
        
    Returns:
        True if successful, False otherwise
    """
    try:
        with open(migration_file_path, 'r') as f:
            migration_sql = f.read()
        
        cursor = connection.cursor()
        # Execute all statements in the migration file
        for statement in migration_sql.split(';'):
            statement = statement.strip()
            if statement and not statement.startswith('--'):
                cursor.execute(statement)
        
        connection.commit()
        cursor.close()
        logger.info(f"Migration executed successfully: {migration_file_path}")
        return True
    except pymysql.Error as err:
        logger.error(f"Error running migration: {err}")
        print(f"Error running migration: {err}")
        connection.rollback()
        return False
    except FileNotFoundError:
        logger.error(f"Migration file not found: {migration_file_path}")
        print(f"Migration file not found: {migration_file_path}")
        return False
