#!/usr/bin/env python3
################################################################################
#
# To-Do Application with Web Access (Lab 5)
# Team 10
#
# Use branches 2 - 7 to implement the functions below (corresponding to issues on Gitlab)
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

load_dotenv() # Load environment variables from .env file


class ToDoApp:
    def __init__(self):
        self.connection = None
        self.cursor = None

    def connect2DB(self):
        try:
            self.connection = pymysql.connect(
                host     = os.getenv("DB_HOST"),
                user     = os.getenv("DB_USER"),
                database = os.getenv("DB_NAME"),
                password = os.getenv("DB_PASSWORD"))
            self.cursor = self.connection.cursor()
            if self.cursor:
                logger.info("Database connected")
            else:
                logger.error("Failed to connect to database")
            return self.connection

        except pymysql.Error as err:
            logger.error(f"Error: {err}")
            return None

    def close_connection(self):
        if self.cursor:
            self.cursor.close()
        if self.connection:
            self.connection.close()

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