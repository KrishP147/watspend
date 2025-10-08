#!/usr/bin/env python3
################################################################################
#
# To-Do Application with Web Access (Lab 5)
# Team 10
#
# Use branches 2 - 7 to implement the functions below (corresponding to issues on Gitlab)
################################################################################

import pymysql
import getpass
import argparse
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

################################################################################
# Command-line Arguments
################################################################################

class OptionalPassword(argparse.Action):
    def __call__(self, parser, namespace, values, option_string=None):
        if values is None:
            setattr(namespace, self.dest, True)
        else:
            setattr(namespace, self.dest, values)

def parseInput(defaultHost, defaultDatabase, defaultUser, defaultPassword):    
    parser = argparse.ArgumentParser(description="To-Do Application with MySQL backend.")
    parser.add_argument('-H', '--hostname', default=defaultHost, help="Hostname")
    parser.add_argument('-d', '--database', default=defaultDatabase, help="Database")
    parser.add_argument('-u', '--username', default=defaultUser, help="Username")
    parser.add_argument('-p', '--password', nargs='?', action=OptionalPassword, help="Password (optional)")
    
    args = parser.parse_args()

    if args.password is None:
        args.password = defaultPassword
    elif args.password is True:
        args.password = getpass.getpass(
            prompt=f"Enter MySQL password for user '{args.username}' on host '{args.hostname}': ")

    return args

################################################################################
# Database Connection
################################################################################

def connect2DB(args):
    """Connect to MySQL database"""
    try:
        connection = pymysql.connect(
            host=args.hostname,
            user=args.username,
            database=args.database,
            password=args.password
        )
        logger.info(f"Connected to database {args.database}")
        return connection
    except pymysql.Error as err:
        logger.error(f"Database connection error: {err}")
        print(f"Error: {err}")
        return None

################################################################################
# Create Table with userid
################################################################################

def createTable(connection):
    """Create ToDoData table with userid field for Lab 5"""
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
# TODO: Team member to implement with userid support
################################################################################

def add(connection, userid, item, type_val=None, started=None, due=None, done=None):
    """
    Add a task for a specific user.
    
    Args:
        connection: MySQL database connection
        userid: User identifier
        item: Task description
        type_val: Task category/type
        started: Start datetime
        due: Due datetime
        done: Completion datetime
    
    Returns:
        True if successful, False otherwise
    
    TODO: Implement this function
    """
    logger.info(f"add() called - userid={userid}, item={item}")
    # TODO: Implement
    pass

################################################################################
# Function: update()
# TODO: Team member to implement with userid support
################################################################################

def update(connection, userid, item, type_val=None, started=None, due=None, done=None):
    """
    Update an existing task for a specific user.
    
    Args:
        connection: MySQL database connection
        userid: User identifier
        item: Task description (identifies the task)
        type_val: Updated task category/type
        started: Updated start datetime
        due: Updated due datetime
        done: Updated completion datetime
    
    Returns:
        True if successful, False otherwise
    
    TODO: Implement this function
    """
    logger.info(f"update() called - userid={userid}, item={item}")
    # TODO: Implement
    pass

################################################################################
# Function: delete()
# TODO: Team member to implement
################################################################################

def delete(connection, userid, item):
    """
    Delete a task for a specific user.
    
    Args:
        connection: MySQL database connection
        userid: User identifier
        item: Task description to delete
    
    Returns:
        True if successful, False otherwise
    
    TODO: Implement this function
    """
    logger.info(f"delete() called - userid={userid}, item={item}")
    # TODO: Implement
    pass

################################################################################
# Function: next()
# TODO: Team member to implement with userid filter
################################################################################

def next(connection, userid):
    """
    Get the next task (earliest due date) for a specific user.
    
    Args:
        connection: MySQL database connection
        userid: User identifier
    
    Returns:
        Dictionary with task details or None if no tasks
    
    TODO: Implement this function
    """
    logger.info(f"next() called - userid={userid}")
    # TODO: Implement
    pass

################################################################################
# Function: today()
# TODO: Team member to implement
################################################################################

def today(connection, userid):
    """
    Get all tasks due today for a specific user.
    
    Args:
        connection: MySQL database connection
        userid: User identifier
    
    Returns:
        List of dictionaries with task details
    
    TODO: Implement this function
    """
    logger.info(f"today() called - userid={userid}")
    # TODO: Implement
    pass

################################################################################
# Function: tomorrow()
# TODO: Team member to implement
################################################################################

def tomorrow(connection, userid):
    """
    Get all tasks due tomorrow for a specific user.
    
    Args:
        connection: MySQL database connection
        userid: User identifier
    
    Returns:
        List of dictionaries with task details
    
    TODO: Implement this function
    """
    logger.info(f"tomorrow() called - userid={userid}")
    # TODO: Implement
    pass

################################################################################
# Main
################################################################################

def main():
    """Main entry point for command-line usage"""
    args = parseInput("riku.shoshin.uwaterloo.ca", "SE101_Team_10", "your_userid", "")
    connection = connect2DB(args)

    if connection:
        print("Successfully connected to MySQL database")
        if createTable(connection):
            print("ToDoData table is ready with userid field")
        else:
            print("Failed to create ToDoData table")
        connection.close()
    else:
        print("Unable to connect to database")
        exit(-1)

if __name__ == "__main__":
    main()