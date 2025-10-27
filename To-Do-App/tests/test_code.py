# do all the following tests in branch 9 (test suite branch): 

# Test plan document in docs/test_plan.md
# All test cases in tests/test_todo.py
# Test for all 6 functions
# Test for Flask routes

# Placeholder tests below (branch 1 + sub branches)

#!/usr/bin/env python3
################################################################################
#
# Test Suite for To-Do Application (Lab 5)
# Team 10
#
################################################################################

import unittest
from datetime import datetime, date, timedelta
from src.code import ToDoApp 
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TestTodoApp(unittest.TestCase):

    def setUp(self):
        self.todo_app = ToDoApp()
        self.todo_app.connect2DB()
        logger.info("Database connected")

    def tearDown(self):
        # self.clean_up("test_0_add")
        # self.clean_up("test_1_update")
        # self.clean_up("test_3_next")
        # self.clean_up("test_3_smoke_test")
        # self.clean_up("test_4_regression_test")
        self.todo_app.close_connection()
        logger.info("Database disconnected")

    def clean_up(self, test_name):
        logger.info(f"Cleanign up after {test_name}")
        # if test_name == "test_0_add":
        #     self.todo_app.cursor.execute("DELETE FROM ToDoData WHERE item = 'Test Add Function'")
        # elif test_name == "test_1_update":
        #     self.todo_app.cursor.execute("DELETE FROM ToDoData WHERE item = 'Test Update Function'")
        # elif test_name == "test_3_next":
        #     self.todo_app.cursor.execute("DELETE FROM ToDoData WHERE item = 'Test Next Function'")
        # elif test_name == "test_3_smoke_test":
        #     self.todo_app.cursor.execute("DELETE FROM ToDoData WHERE item = 'Smoke Task'")
        # elif test_name == "test_4_regression_test":
        #     self.todo_app.cursor.execute("DELETE FROM ToDoData WHERE item LIKE 'Regression Task%'")
        # self.todo_app.connection.commit()
        logger.info(f"Cleanup completed for {test_name}")

    def test_add_placeholder():
        """Placeholder - TODO: Implement actual add() tests"""
        # TODO: Test basic task addition
        # TODO: Test with all parameters
        # TODO: Test duplicate prevention
        # TODO: Test with different userids
        # TODO: Test error handling
        pass

    ################################################################################
    # Tests for update() function
    # TODO: Team member to implement comprehensive tests
    ################################################################################

    def test_update_placeholder():
        """Placeholder - TODO: Implement actual update() tests"""
        # TODO: Test successful update
        # TODO: Test updating non-existent task
        # TODO: Test userid filtering
        # TODO: Test error handling
        pass

    ################################################################################
    # Tests for delete() function
    # TODO: Team member to implement comprehensive tests
    ################################################################################

    def test_delete_placeholder():
        """Placeholder - TODO: Implement actual delete() tests"""
        # TODO: Test successful deletion
        # TODO: Test deleting non-existent task
        # TODO: Test userid filtering
        # TODO: Test error handling
        pass

    ################################################################################
    # Tests for next() function
    # TODO: Team member to implement comprehensive tests
    ################################################################################

    def test_next_placeholder():
        """Placeholder - TODO: Implement actual next() tests"""
        # TODO: Test returning earliest due task
        # TODO: Test with no tasks
        # TODO: Test userid filtering
        # TODO: Test with multiple tasks
        pass

    ################################################################################
    # Tests for today() function
    # TODO: Team member to implement comprehensive tests
    ################################################################################

    def test_today_placeholder():
        """Placeholder - TODO: Implement actual today() tests"""
        # TODO: Test returning today's tasks
        # TODO: Test with no tasks today
        # TODO: Test date comparison
        # TODO: Test userid filtering
        pass

    ################################################################################
    # Tests for tomorrow() function
    # TODO: Team member to implement comprehensive tests
    ################################################################################

    def test_tomorrow_placeholder():
        """Placeholder - TODO: Implement actual tomorrow() tests"""
        # TODO: Test returning tomorrow's tasks
        # TODO: Test with no tasks tomorrow
        # TODO: Test date comparison
        # TODO: Test userid filtering
        pass