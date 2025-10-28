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
    cursor = connection.cursor()

    sql = """
        INSERT INTO ToDoData (item, type, userid, started, due, done)
        VALUES (%s, %s, %s, %s, %s, NULL)
        """

    try:
        cursor.execute(sql, (item, type_val, userid, started, due))
        connection.commit()
        logger.info(f"add() called - userid={userid}, item={item}")
        return True

    except pymysql.err.IntegrityError as err:  # catches duplicate key errors
        logger.error(f"Duplicate or constraint error adding task: {err}")
        return False

    except pymysql.Error as err:
        logger.error(f"General SQL error: {err}")
        return False

    except Exception as err:  # catch any other exceptions (including mock exceptions)
        logger.error(f"Unexpected error: {err}")
        return False

    finally:
        cursor.close()

    logger.info(f"add() called - userid={userid}, item={item}")
    
    return True

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
    """
    logger.info(f"next() called - userid={userid}")
    cursor = connection.cursor()
    
    try:
        # Query for earliest due task
        query = """
            SELECT item, type, started, due, done
            FROM ToDoData
            WHERE userid = %s AND due IS NOT NULL
            ORDER BY due ASC
            LIMIT 1
        """
        cursor.execute(query, (userid,))
        row = cursor.fetchone()
        
        if not row:
            logger.info(f"No tasks with due dates found for user {userid}")
            return None
        
        # Build result dictionary
        result = {
            "item": row[0],
            "type": row[1],
            "started": row[2],
            "due": row[3],
            "done": row[4]
        }
        
        logger.info(f"Next task retrieved for user {userid}: {result['item']}")
        return result
        
    except pymysql.Error as err:
        logger.error(f"Database error in next() for user {userid}: {err}")
        raise err
    finally:
        cursor.close()

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

    # Use CURDATE() directly in SQL for reliable date comparison
    query = """
        SELECT item, type, started, due, done
        FROM ToDoData
        WHERE userid = %s AND DATE(due) = CURDATE()
    """

    try:
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute(query, (userid,))
            results = cursor.fetchall()
        logger.info(f"today(): found {len(results)} task(s) for userid={userid}")
        return results

    except pymysql.Error as e:
        # Rollback the connection in case of errors to avoid partial transactions
        connection.rollback()
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
    """
    logger.info(f"tomorrow() called - userid={userid}")
    cursor = connection.cursor()
    
    try:
        # Query for tasks due tomorrow
        query = """
            SELECT item, type, started, due, done
            FROM ToDoData
            WHERE userid = %s AND DATE(due) = DATE_ADD(CURDATE(), INTERVAL 1 DAY)
        """
        cursor.execute(query, (userid,))
        rows = cursor.fetchall()
        
        if not rows:
            logger.info(f"No tasks due tomorrow for user {userid}")
            return []
        
        # Build result list
        results = []
        for row in rows:
            task = {
                "item": row[0],
                "type": row[1],
                "started": row[2],
                "due": row[3],
                "done": row[4]
            }
            results.append(task)
        
        logger.info(f"{len(results)} task(s) due tomorrow for user {userid}")
        return results
        
    except pymysql.Error as err:
        logger.error(f"Database error in tomorrow() for user {userid}: {err}")
        raise err
    finally:
        cursor.close()

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