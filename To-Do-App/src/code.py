#!/usr/bin/env python3
################################################################################
#
# To-Do Application with Web Access (Lab 5)
# Team 10
#
# Use branches 2-7 to implement the functions below (corresponding to issues on GitLab)
################################################################################

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
            filename="todo.log",
            filemode="a",
            level=logging.DEBUG,
            format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
        )

configureLogging()
logger = logging.getLogger("todo")

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
# Create Table with userid
################################################################################

def createTable(connection):
    """
    Create ToDoData table with userid field for Lab 5.
    
    Args:
        connection: MySQL database connection
        
    Returns:
        True if successful, False otherwise
    """
    try:
        cursor = connection.cursor()
        create_table_query = """
            CREATE TABLE IF NOT EXISTS ToDoData (
                userid VARCHAR(255),
                item VARCHAR(255),
                type VARCHAR(255),
                started DATETIME,
                due DATETIME,
                done DATETIME,
                PRIMARY KEY (userid, item)
            )
            """
        cursor.execute(create_table_query)
        connection.commit()
        cursor.close()
        logger.info("ToDoData table created/verified with userid field")
        return True
    except pymysql.Error as err:
        logger.error(f"Error creating table: {err}")
        print(f"Error creating table: {err}")
        return False

################################################################################
# Function: add()
# TODO: Team member to implement with userid support (Issue #2)
################################################################################

def add(connection, userid, item, type_val=None, started=None, due=None, done=None):
    """
    Add a task for a specific user.
    
    Args:
        connection: MySQL database connection
        userid: User identifier
        item: Task description
        type_val: Task category/type (optional)
        started: Start datetime (optional)
        due: Due datetime (optional)
        done: Completion datetime (optional)
    
    Returns:
        True if successful, raises exception otherwise
        
    Raises:
        ValueError: If duplicate (userid, item) exists
        pymysql.Error: On database errors
    
    TODO: Implement this function in Issue #2
    """
    logger.info(f"add() called - userid={userid}, item={item}")
    # TODO: Implement
    pass

################################################################################
# Function: update()
# TODO: Team member to implement with userid support (Issue #3)
################################################################################

def update(connection, userid, item, type_val=None, started=None, due=None, done=None):
    """
    Update an existing task for a specific user.
    
    Args:
        connection: MySQL database connection
        userid: User identifier
        item: Task description (identifies the task)
        type_val: Updated task category/type (optional)
        started: Updated start datetime (optional)
        due: Updated due datetime (optional)
        done: Updated completion datetime (optional)
    
    Returns:
        True if successful, raises exception otherwise
        
    Raises:
        ValueError: If task (userid, item) does not exist
        pymysql.Error: On database errors
    
    TODO: Implement this function in Issue #3
    """
    logger.info(f"update() called - userid={userid}, item={item}")
    # TODO: Implement
    pass

################################################################################
# Function: delete()
# TODO: Team member to implement (Issue #4)
################################################################################

def delete(connection, userid, item):
    """
    Delete a task for a specific user.
    
    Args:
        connection: MySQL database connection
        userid: User identifier
        item: Task description to delete
    
    Returns:
        True if successful, raises exception otherwise
        
    Raises:
        ValueError: If task (userid, item) does not exist
        pymysql.Error: On database errors
    
    TODO: Implement this function in Issue #4
    """
    logger.info(f"delete() called - userid={userid}, item={item}")
    # TODO: Implement
    pass

################################################################################
# Function: next()
# TODO: Team member to implement with userid filter (Issue #5)
################################################################################

def next(connection, userid):
    """
    Get the next task (earliest due date) for a specific user.
    
    Args:
        connection: MySQL database connection
        userid: User identifier
    
    Returns:
        Dictionary with task details: {item, type, started, due, done}
        None if no tasks with due dates exist
        
    Raises:
        pymysql.Error: On database errors
    
    TODO: Implement this function in Issue #5
    """
    logger.info(f"next() called - userid={userid}")
    # TODO: Implement
    pass

################################################################################
# Function: today()
# TODO: Team member to implement (Issue #6)
################################################################################

def today(connection, userid):
    """
    Get all tasks due today for a specific user.
    
    Args:
        connection: MySQL database connection
        userid: User identifier
    
    Returns:
        List of dictionaries with task details: [{item, type, started, due, done}, ...]
        Empty list if no tasks due today
        
    Raises:
        pymysql.Error: On database errors
    """
    logger.info(f"today() called - userid={userid}")

    query = """
        SELECT item, type, started, due, done
        FROM ToDoData
        WHERE userid = %s AND DATE(due) = %s
        ORDER BY due ASC
    """
    today_date = date.today()  # YYYY-MM-DD

    try:
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute(query, (userid, today_date))
            results = cursor.fetchall()
        logger.info(f"today(): found {len(results)} tasks for userid={userid}")
        return results
    except pymysql.Error as e:
        logger.error(f"today() MySQL error for userid={userid}: {e}")
        raise


################################################################################
# Function: tomorrow()
# TODO: Team member to implement (Issue #7)
################################################################################

def tomorrow(connection, userid):
    """
    Get all tasks due tomorrow for a specific user.
    
    Args:
        connection: MySQL database connection
        userid: User identifier
    
    Returns:
        List of dictionaries with task details: [{item, type, started, due, done}, ...]
        Empty list if no tasks due tomorrow
        
    Raises:
        pymysql.Error: On database errors
    
    TODO: Implement this function in Issue #7
    """
    logger.info(f"tomorrow() called - userid={userid}")
    # TODO: Implement
    pass

################################################################################
# Main - For Testing Database Connection
################################################################################

def main():
    """Main entry point for testing database connection"""
    print("Testing database connection...")
    connection = get_db_connection()

    if connection:
        print("✓ Successfully connected to MySQL database")
        if createTable(connection):
            print("✓ ToDoData table is ready with userid field")
        else:
            print("✗ Failed to create ToDoData table")
        connection.close()
        print("✓ Connection closed")
    else:
        print("✗ Unable to connect to database")
        print("  Check your .env file has correct credentials")
        exit(-1)

if __name__ == "__main__":
    main()