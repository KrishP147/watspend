#!/usr/bin/env python3
################################################################################
#
# Test Suite for To-Do Application (Lab 5)
# Team 10
#
# NOTE: Comprehensive tests will be implemented in Issue #9 (test suite branch)
# This file contains placeholder structure for both unit and integration tests
################################################################################

import pytest
import unittest
import sys
import os
from unittest.mock import Mock, MagicMock
from datetime import datetime, date, timedelta
import logging
import pymysql

# Add src directory to path - use absolute path
import sys
import os

# Get absolute path to src directory
src_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'src'))
if src_path in sys.path:
    sys.path.remove(src_path)
sys.path.insert(0, src_path)

# Force reload if already imported
if 'code' in sys.modules:
    del sys.modules['code']

import code as todo

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

################################################################################
# UNIT TESTS WITH MOCKS (Fast, for CI/CD)
# Tested by: KRISH
################################################################################

@pytest.fixture
def mock_connection():
    """Fixture to create a mock database connection and cursor"""
    connection = MagicMock()
    cursor = MagicMock()
    connection.cursor.return_value = cursor
    return connection

################################################################################
# Tests for add() function - BY KRISH
################################################################################

def test_add_basic_success(mock_connection):
    """Test basic task addition with minimal parameters"""
    cursor = mock_connection.cursor.return_value
    cursor.execute.return_value = None
    
    result = todo.add(mock_connection, "test_user", "Buy milk")
    
    assert result == True
    cursor.execute.assert_called_once()
    mock_connection.commit.assert_called_once()
    cursor.close.assert_called_once()

def test_add_with_all_parameters(mock_connection):
    """Test task addition with all optional parameters"""
    cursor = mock_connection.cursor.return_value
    cursor.execute.return_value = None
    
    started = datetime(2024, 12, 1, 10, 0)
    due = datetime(2024, 12, 25, 23, 59)
    
    result = todo.add(
        mock_connection, 
        "test_user", 
        "Complete project",
        type_val="work",
        started=started,
        due=due,
        done=None
    )
    
    assert result == True
    cursor.execute.assert_called_once()
    mock_connection.commit.assert_called_once()

def test_add_duplicate_task(mock_connection):
    """Test that adding duplicate task returns False"""
    cursor = mock_connection.cursor.return_value
    cursor.execute.side_effect = pymysql.err.IntegrityError("Duplicate entry")
    
    result = todo.add(mock_connection, "test_user", "Buy milk")
    
    assert result == False
    cursor.close.assert_called_once()

def test_add_sql_error(mock_connection):
    """Test handling of general SQL errors"""
    cursor = mock_connection.cursor.return_value
    cursor.execute.side_effect = pymysql.Error("SQL error")
    
    result = todo.add(mock_connection, "test_user", "Buy milk")
    
    assert result == False
    cursor.close.assert_called_once()

def test_add_userid_isolation(mock_connection):
    """Test that tasks are associated with correct userid"""
    cursor = mock_connection.cursor.return_value
    
    result = todo.add(mock_connection, "user1", "Task for user1")
    
    # Verify the SQL contains the correct userid
    call_args = cursor.execute.call_args
    assert "user1" in str(call_args)
    assert result == True

################################################################################
# Tests for update() function - BY KRISH
################################################################################

def test_update_basic_success(mock_connection):
    """Test successful update of existing task"""
    cursor = mock_connection.cursor.return_value
    # Mock the COUNT check to return 1 (task exists)
    cursor.fetchone.return_value = (1,)
    
    result = todo.update(
        mock_connection, 
        "test_user", 
        "Buy milk",
        type_val="personal"
    )
    
    assert result == True
    assert cursor.execute.call_count == 2  # Check query + update query
    mock_connection.commit.assert_called_once()
    cursor.close.assert_called_once()

def test_update_nonexistent_task(mock_connection):
    """Test updating task that doesn't exist raises ValueError"""
    cursor = mock_connection.cursor.return_value
    # Mock the COUNT check to return 0 (task doesn't exist)
    cursor.fetchone.return_value = (0,)
    
    with pytest.raises(ValueError, match="No task found"):
        todo.update(mock_connection, "test_user", "Nonexistent task")
    
    cursor.close.assert_called_once()

def test_update_multiple_fields(mock_connection):
    """Test updating multiple fields at once"""
    cursor = mock_connection.cursor.return_value
    cursor.fetchone.return_value = (1,)
    
    started = datetime(2024, 12, 1)
    due = datetime(2024, 12, 25)
    done = datetime(2024, 12, 20)
    
    result = todo.update(
        mock_connection,
        "test_user",
        "Project task",
        type_val="work",
        started=started,
        due=due,
        done=done
    )
    
    assert result == True
    mock_connection.commit.assert_called_once()

def test_update_no_fields(mock_connection):
    """Test update with no fields returns False"""
    cursor = mock_connection.cursor.return_value
    cursor.fetchone.return_value = (1,)
    
    result = todo.update(mock_connection, "test_user", "Some task")
    
    assert result == False

def test_update_userid_filtering(mock_connection):
    """Test that update only affects tasks for specific userid"""
    cursor = mock_connection.cursor.return_value
    cursor.fetchone.return_value = (1,)
    
    result = todo.update(
        mock_connection,
        "user1",
        "Task A",
        type_val="updated"
    )
    
    # Verify userid is in the query
    call_args = cursor.execute.call_args
    assert "user1" in str(call_args)
    assert result == True

def test_update_sql_error(mock_connection):
    """Test handling of SQL errors during update"""
    cursor = mock_connection.cursor.return_value
    cursor.fetchone.return_value = (1,)
    cursor.execute.side_effect = [None, pymysql.Error("SQL error")]
    
    with pytest.raises(pymysql.Error):
        todo.update(mock_connection, "test_user", "Task", type_val="new")
    
    cursor.close.assert_called_once()

################################################################################
# Tests for delete() function - BY ELAINE
# TODO: Implement in Issue #9
################################################################################

def test_delete_basic_success(mock_connection):
    """Test successful deletion of existing task"""
    cursor = mock_connection.cursor.return_value
    cursor.fetchone.side_effect = [(1,)]  # Task exists

    result = todo.delete(mock_connection, "test_user", "Buy milk")

    assert result is True
    cursor.execute.assert_any_call(
        "SELECT COUNT(*) FROM ToDoData WHERE userid = %s AND item = %s",
        ("test_user", "Buy milk")
    )
    cursor.execute.assert_any_call(
        "DELETE FROM ToDoData WHERE userid = %s AND item = %s",
        ("test_user", "Buy milk")
    )
    mock_connection.commit.assert_called_once()
    cursor.close.assert_called_once()


def test_delete_nonexistent_task(mock_connection):
    """Test deleting a task that doesn't exist raises ValueError"""
    cursor = mock_connection.cursor.return_value
    cursor.fetchone.side_effect = [(0,)]  # Task not found

    with pytest.raises(ValueError, match="does not exist"):
        todo.delete(mock_connection, "user1", "Nonexistent task")

    cursor.execute.assert_called_once()
    cursor.close.assert_called_once()


def test_delete_sql_error(mock_connection):
    """Test handling of SQL errors during deletion"""
    cursor = mock_connection.cursor.return_value
    cursor.fetchone.side_effect = [(1,)]  # Task exists
    cursor.execute.side_effect = [None, pymysql.Error("SQL error")]

    with pytest.raises(pymysql.Error):
        todo.delete(mock_connection, "test_user", "Task X")

    mock_connection.rollback.assert_called_once()
    cursor.close.assert_called_once()


def test_delete_userid_isolation(mock_connection):
    """Test that delete only affects the correct userid"""
    cursor = mock_connection.cursor.return_value
    cursor.fetchone.side_effect = [(1,)]

    todo.delete(mock_connection, "userA", "Task Z")

    calls = [str(call) for call in cursor.execute.call_args_list]
    assert any("userA" in c for c in calls)
    mock_connection.commit.assert_called_once()
    cursor.close.assert_called_once()


def test_delete_commit_failure_triggers_rollback(mock_connection):
    """Test that a commit() failure triggers rollback"""
    cursor = mock_connection.cursor.return_value
    cursor.fetchone.side_effect = [(1,)]
    mock_connection.commit.side_effect = pymysql.Error("Commit failed")

    with pytest.raises(pymysql.Error):
        todo.delete(mock_connection, "test_user", "Task commit fail")

    mock_connection.rollback.assert_called_once()
    cursor.close.assert_called_once()


def test_delete_cursor_close_failure(mock_connection):
    """Test that cursor.close() failure does not break the function"""
    cursor = mock_connection.cursor.return_value
    cursor.fetchone.side_effect = [(1,)]
    cursor.close.side_effect = Exception("close failed")

    result = todo.delete(mock_connection, "userB", "Task Y")
    assert result is True
    mock_connection.commit.assert_called_once()


class TestDeleteIntegration(unittest.TestCase):
    """Integration tests for delete() function with real database"""

    def setUp(self):
        """Setup: Connect to database and insert test task"""
        self.connection = todo.get_db_connection()
        self.assertIsNotNone(self.connection, "Failed to connect to database")
        self.test_userid = "test_delete_user"
        self.cleanup()

        # Insert a test record
        todo.add(self.connection, self.test_userid, "Task to delete")
        logger.info("Database connected for delete() integration test")

    def tearDown(self):
        """Teardown: Clean up test data"""
        self.cleanup()
        if self.connection:
            self.connection.close()
        logger.info("Database disconnected")

    def cleanup(self):
        """Remove all test data"""
        try:
            cursor = self.connection.cursor()
            cursor.execute("DELETE FROM ToDoData WHERE userid = %s", (self.test_userid,))
            self.connection.commit()
            cursor.close()
        except:
            pass

    def test_delete_existing_task(self):
        """Test that delete() removes an existing task"""
        cursor = self.connection.cursor()
        cursor.execute("SELECT COUNT(*) FROM ToDoData WHERE userid = %s", (self.test_userid,))
        before = cursor.fetchone()[0]
        cursor.close()
        self.assertEqual(before, 1)

        result = todo.delete(self.connection, self.test_userid, "Task to delete")
        self.assertTrue(result)

        # Verify it was deleted
        cursor = self.connection.cursor()
        cursor.execute("SELECT COUNT(*) FROM ToDoData WHERE userid = %s", (self.test_userid,))
        after = cursor.fetchone()[0]
        cursor.close()
        self.assertEqual(after, 0)

    def test_delete_nonexistent_task_integration(self):
        """Deleting nonexistent task should raise ValueError"""
        with self.assertRaises(ValueError):
            todo.delete(self.connection, self.test_userid, "Nonexistent Task")

    def test_delete_userid_isolation_integration(self):
        """Test that delete for one user does not affect others"""
        # Add same task for another user
        todo.add(self.connection, "other_user", "Task to delete")

        # Delete for test user
        result = todo.delete(self.connection, self.test_userid, "Task to delete")
        self.assertTrue(result)

        # Verify the other user still has their task
        cursor = self.connection.cursor()
        cursor.execute(
            "SELECT COUNT(*) FROM ToDoData WHERE userid = %s AND item = %s",
            ("other_user", "Task to delete")
        )
        count = cursor.fetchone()[0]
        cursor.close()
        self.assertEqual(count, 1)

        # Cleanup
        cursor = self.connection.cursor()
        cursor.execute("DELETE FROM ToDoData WHERE userid = %s", ("other_user",))
        self.connection.commit()
        cursor.close()

################################################################################
# Tests for next() function - BY SHIMAN
# TODO: Implement in Issue #9
################################################################################

def test_next_basic_success(mock_connection):
    """Test that next() returns the earliest due task"""
    cursor = mock_connection.cursor.return_value
    cursor.fetchone.return_value = ("Buy milk", "personal", "2025-10-31", "2025-11-01", None)

    result = todo.next(mock_connection, "test_user1")

    assert result == {
        "item": "Buy milk",
        "type": "personal",
        "started": "2025-10-31",
        "due": "2025-11-01",
        "done": None
    }

    cursor.execute.assert_called_once_with(
        """
            SELECT item, type, started, due, done
            FROM ToDoData
            WHERE userid = %s AND due IS NOT NULL
            ORDER BY due ASC
            LIMIT 1
        """,
        ("test_user1",)
    )
    cursor.close.assert_called_once()


def test_next_no_due_tasks(mock_connection):
    """Test that next() returns None if user has no due tasks"""
    cursor = mock_connection.cursor.return_value
    cursor.fetchone.return_value = None

    result = todo.next(mock_connection, "test_userA")
    assert result is None
    cursor.close.assert_called_once()


def test_next_sql_error(mock_connection):
    """Test handling of SQL errors during query"""
    cursor = mock_connection.cursor.return_value
    cursor.execute.side_effect = pymysql.Error("SQL error")

    with pytest.raises(pymysql.Error):
        todo.next(mock_connection, "test_userB")

    cursor.close.assert_called_once()


def test_next_userid_isolation(mock_connection):
    """Test that query uses correct userid parameter"""
    cursor = mock_connection.cursor.return_value
    cursor.fetchone.return_value = ("Task A", "work", "2025-10-30", "2025-10-31", None)

    result = todo.next(mock_connection, "special_test_user")
    assert result["item"] == "Task A"

    calls = [str(call) for call in cursor.execute.call_args_list]
    assert any("special_test_user" in c for c in calls)
    cursor.close.assert_called_once()


def test_next_cursor_close_failure(mock_connection):
    """Test that cursor.close() failure does not break next()"""
    cursor = mock_connection.cursor.return_value
    cursor.fetchone.return_value = ("Task B", "work", "2025-10-30", "2025-10-31", None)
    cursor.close.side_effect = Exception("close failed")

    result = todo.next(mock_connection, "test_userC")
    assert result["item"] == "Task B"


class TestNextIntegration(unittest.TestCase):
    """Integration tests for next() function with real database"""

    def setUp(self):
        """Setup: Connect to database"""
        self.connection = todo.get_db_connection()
        self.assertIsNotNone(self.connection, "Failed to connect to database")
        self.test_userid = "test_next_user"
        self.cleanup()
        logger.info("Database connected for next() integration test")

    def tearDown(self):
        """Teardown: Clean up test data"""
        self.cleanup()
        if self.connection:
            self.connection.close()
        logger.info("Database disconnected")

    def cleanup(self):
        """Remove all test data"""
        try:
            cursor = self.connection.cursor()
            cursor.execute("DELETE FROM ToDoData WHERE userid = %s", (self.test_userid,))
            self.connection.commit()
            cursor.close()
        except:
            pass

    def test_next_returns_earliest_due(self):
        """Test that next() returns the task with the nearest due date"""
        now = datetime.now()
        cursor = self.connection.cursor()
        cursor.execute(
            "INSERT INTO ToDoData (userid, item, type, started, due, done) VALUES (%s, %s, %s, %s, %s, %s)",
            (self.test_userid, "Task A", "work", now, now + timedelta(days=2), None)
        )
        cursor.execute(
            "INSERT INTO ToDoData (userid, item, type, started, due, done) VALUES (%s, %s, %s, %s, %s, %s)",
            (self.test_userid, "Task B", "study", now, now + timedelta(days=1), None)
        )
        self.connection.commit()
        cursor.close()

        result = todo.next(self.connection, self.test_userid)
        self.assertIsNotNone(result)
        self.assertEqual(result["item"], "Task B")

    def test_next_returns_none_if_no_due_dates(self):
        """Test next() returns None when user has tasks but no due dates"""
        self.cleanup()
        now = datetime.now()
        cursor = self.connection.cursor()
        cursor.execute(
            "INSERT INTO ToDoData (userid, item, type, started, due, done) VALUES (%s, %s, %s, %s, %s, %s)",
            (self.test_userid, "Task D", "misc", now, None, None)
        )
        self.connection.commit()
        cursor.close()

        result = todo.next(self.connection, self.test_userid)
        self.assertIsNone(result)

    def test_next_no_tasks_for_user(self):
        """Return None if the user has no tasks at all"""
        self.cleanup()
        result = todo.next(self.connection, self.test_userid)
        self.assertIsNone(result)

    def test_next_userid_isolation_integration(self):
        """Ensure other users' tasks do not affect current user"""
        now = datetime.now()
        cursor = self.connection.cursor()
        cursor.execute(
            "INSERT INTO ToDoData (userid, item, type, started, due, done) VALUES (%s, %s, %s, %s, %s, %s)",
            ("other_test_user", "Other Task", "work", now, now + timedelta(hours=1), None)
        )
        cursor.execute(
            "INSERT INTO ToDoData (userid, item, type, started, due, done) VALUES (%s, %s, %s, %s, %s, %s)",
            (self.test_userid, "My Task", "study", now, now + timedelta(hours=2), None)
        )
        self.connection.commit()
        cursor.close()

        result = todo.next(self.connection, self.test_userid)
        self.assertEqual(result["item"], "My Task")

        # Verify other user’s task remains
        cursor = self.connection.cursor()
        cursor.execute("SELECT COUNT(*) FROM ToDoData WHERE userid = %s", ("other_test_user",))
        count = cursor.fetchone()[0]
        cursor.close()
        self.assertEqual(count, 1)

################################################################################
# Tests for today() function - BY LIRON
# TODO: Implement in Issue #9
################################################################################

def test_today_basic_success(mock_connection):
    """Test that today() returns tasks due today"""
    cursor_mock = MagicMock()
    cursor_mock.fetchall.return_value = [
        {"item": "Submit assignment", "type": "work", "started": "2024-11-04", "due": "2024-11-04", "done": None},
        {"item": "Buy groceries", "type": "personal", "started": "2024-11-04", "due": "2024-11-04", "done": None}
    ]
    
    # Mock the context manager
    mock_connection.cursor.return_value.__enter__.return_value = cursor_mock
    mock_connection.cursor.return_value.__exit__.return_value = None

    result = todo.today(mock_connection, "test_user")

    assert len(result) == 2
    assert result[0]["item"] == "Submit assignment"
    assert result[1]["item"] == "Buy groceries"
    
    # Check that cursor was called with DictCursor
    mock_connection.cursor.assert_called_once_with(pymysql.cursors.DictCursor)
    cursor_mock.execute.assert_called_once_with(
        """
        SELECT item, type, started, due, done
        FROM ToDoData
        WHERE userid = %s AND DATE(due) = CURDATE()
    """,
        ("test_user",)
    )


def test_today_no_tasks_due_today(mock_connection):
    """Test that today() returns empty list if no tasks due today"""
    cursor_mock = MagicMock()
    cursor_mock.fetchall.return_value = []

    mock_connection.cursor.return_value.__enter__.return_value = cursor_mock
    mock_connection.cursor.return_value.__exit__.return_value = None

    result = todo.today(mock_connection, "test_user")

    assert result == []
    assert isinstance(result, list)


def test_today_sql_error(mock_connection):
    """Test handling of SQL errors during query"""
    cursor_mock = MagicMock()
    cursor_mock.execute.side_effect = pymysql.Error("SQL error")

    mock_connection.cursor.return_value.__enter__.return_value = cursor_mock
    mock_connection.cursor.return_value.__exit__.return_value = None

    with pytest.raises(pymysql.Error):
        todo.today(mock_connection, "test_user")

    mock_connection.rollback.assert_called_once()


def test_today_userid_isolation(mock_connection):
    """Test that query uses correct userid parameter"""
    cursor_mock = MagicMock()
    cursor_mock.fetchall.return_value = [
        {"item": "User specific task", "type": "work", "started": "2024-11-04", "due": "2024-11-04", "done": None}
    ]

    mock_connection.cursor.return_value.__enter__.return_value = cursor_mock
    mock_connection.cursor.return_value.__exit__.return_value = None

    result = todo.today(mock_connection, "specific_test_user")
    
    assert len(result) == 1
    assert result[0]["item"] == "User specific task"
    cursor_mock.execute.assert_called_once_with(
        """
        SELECT item, type, started, due, done
        FROM ToDoData
        WHERE userid = %s AND DATE(due) = CURDATE()
    """,
        ("specific_test_user",)
    )


def test_today_multiple_tasks_due_today(mock_connection):
    """Test that today() returns all tasks due today"""
    cursor_mock = MagicMock()
    cursor_mock.fetchall.return_value = [
        {"item": "Morning task", "type": "personal", "started": "2024-11-04", "due": "2024-11-04", "done": None},
        {"item": "Afternoon task", "type": "work", "started": "2024-11-04", "due": "2024-11-04", "done": None},
        {"item": "Evening task", "type": "personal", "started": "2024-11-04", "due": "2024-11-04", "done": None}
    ]

    mock_connection.cursor.return_value.__enter__.return_value = cursor_mock
    mock_connection.cursor.return_value.__exit__.return_value = None

    result = todo.today(mock_connection, "busy_user")

    assert len(result) == 3
    assert all(task["due"] == "2024-11-04" for task in result)


def test_today_with_completed_tasks(mock_connection):
    """Test that today() includes both completed and incomplete tasks due today"""
    cursor_mock = MagicMock()
    cursor_mock.fetchall.return_value = [
        {"item": "Completed task", "type": "work", "started": "2024-11-04", "due": "2024-11-04", "done": "2024-11-04"},
        {"item": "Incomplete task", "type": "personal", "started": "2024-11-04", "due": "2024-11-04", "done": None}
    ]

    mock_connection.cursor.return_value.__enter__.return_value = cursor_mock
    mock_connection.cursor.return_value.__exit__.return_value = None

    result = todo.today(mock_connection, "test_user")

    assert len(result) == 2
    assert result[0]["done"] == "2024-11-04"  # completed
    assert result[1]["done"] is None  # incomplete


def test_today_context_manager_usage(mock_connection):
    """Test that today() properly uses context manager for cursor"""
    cursor_mock = MagicMock()
    cursor_mock.fetchall.return_value = []

    mock_connection.cursor.return_value.__enter__.return_value = cursor_mock
    mock_connection.cursor.return_value.__exit__.return_value = None

    todo.today(mock_connection, "test_user")

    # Verify context manager methods were called
    mock_connection.cursor.return_value.__enter__.assert_called_once()
    mock_connection.cursor.return_value.__exit__.assert_called_once()

class TestTodayIntegration(unittest.TestCase):
    """Integration tests for today() function with real database"""

    def setUp(self):
        """Setup: Connect to database"""
        self.connection = todo.get_db_connection()
        self.assertIsNotNone(self.connection, "Failed to connect to database")
        self.test_userid = "test_today_user"
        self.cleanup()
        logger.info("Database connected for today() integration test")

    def tearDown(self):
        """Teardown: Clean up test data"""
        self.cleanup()
        if self.connection:
            self.connection.close()
        logger.info("Database disconnected")

    def cleanup(self):
        """Remove all test data"""
        try:
            cursor = self.connection.cursor()
            cursor.execute("DELETE FROM ToDoData WHERE userid = %s", (self.test_userid,))
            self.connection.commit()
            cursor.close()
        except:
            pass

    def test_today_returns_tasks_due_today(self):
        """Test that today() returns tasks due today"""
        now = datetime.now()
        today_date = now.date()
        
        # Insert tasks due today
        cursor = self.connection.cursor()
        cursor.execute(
            "INSERT INTO ToDoData (userid, item, type, started, due, done) VALUES (%s, %s, %s, %s, %s, %s)",
            (self.test_userid, "Task due today 1", "work", now, today_date, None)
        )
        cursor.execute(
            "INSERT INTO ToDoData (userid, item, type, started, due, done) VALUES (%s, %s, %s, %s, %s, %s)",
            (self.test_userid, "Task due today 2", "personal", now, today_date, None)
        )
        # Insert task due tomorrow (should not appear)
        cursor.execute(
            "INSERT INTO ToDoData (userid, item, type, started, due, done) VALUES (%s, %s, %s, %s, %s, %s)",
            (self.test_userid, "Task due tomorrow", "work", now, today_date + timedelta(days=1), None)
        )
        self.connection.commit()
        cursor.close()

        result = todo.today(self.connection, self.test_userid)
        
        self.assertEqual(len(result), 2)
        task_items = [task["item"] for task in result]
        self.assertIn("Task due today 1", task_items)
        self.assertIn("Task due today 2", task_items)
        self.assertNotIn("Task due tomorrow", task_items)

    def test_today_returns_empty_list_no_tasks(self):
        """Test that today() returns empty list when no tasks due today"""
        # Don't insert any tasks
        result = todo.today(self.connection, self.test_userid)
        self.assertEqual(result, [])
        self.assertIsInstance(result, list)

    def test_today_returns_empty_list_no_today_tasks(self):
        """Test that today() returns empty list when user has tasks but none due today"""
        now = datetime.now()
        yesterday = now.date() - timedelta(days=1)
        tomorrow = now.date() + timedelta(days=1)
        
        cursor = self.connection.cursor()
        cursor.execute(
            "INSERT INTO ToDoData (userid, item, type, started, due, done) VALUES (%s, %s, %s, %s, %s, %s)",
            (self.test_userid, "Task due yesterday", "work", now, yesterday, None)
        )
        cursor.execute(
            "INSERT INTO ToDoData (userid, item, type, started, due, done) VALUES (%s, %s, %s, %s, %s, %s)",
            (self.test_userid, "Task due tomorrow", "work", now, tomorrow, None)
        )
        self.connection.commit()
        cursor.close()

        result = todo.today(self.connection, self.test_userid)
        self.assertEqual(result, [])

    def test_today_includes_completed_tasks(self):
        """Test that today() includes both completed and incomplete tasks due today"""
        now = datetime.now()
        today_date = now.date()
        
        cursor = self.connection.cursor()
        cursor.execute(
            "INSERT INTO ToDoData (userid, item, type, started, due, done) VALUES (%s, %s, %s, %s, %s, %s)",
            (self.test_userid, "Completed task today", "work", now, today_date, now)
        )
        cursor.execute(
            "INSERT INTO ToDoData (userid, item, type, started, due, done) VALUES (%s, %s, %s, %s, %s, %s)",
            (self.test_userid, "Incomplete task today", "personal", now, today_date, None)
        )
        self.connection.commit()
        cursor.close()

        result = todo.today(self.connection, self.test_userid)
        
        self.assertEqual(len(result), 2)
        completed_task = next(task for task in result if task["item"] == "Completed task today")
        incomplete_task = next(task for task in result if task["item"] == "Incomplete task today")
        
        self.assertIsNotNone(completed_task["done"])
        self.assertIsNone(incomplete_task["done"])

    def test_today_userid_isolation_integration(self):
        """Test that today() only returns tasks for the specified user"""
        now = datetime.now()
        today_date = now.date()
        
        cursor = self.connection.cursor()
        # Add task for test user
        cursor.execute(
            "INSERT INTO ToDoData (userid, item, type, started, due, done) VALUES (%s, %s, %s, %s, %s, %s)",
            (self.test_userid, "My task today", "work", now, today_date, None)
        )
        # Add task for different user
        cursor.execute(
            "INSERT INTO ToDoData (userid, item, type, started, due, done) VALUES (%s, %s, %s, %s, %s, %s)",
            ("other_test_user", "Other user task today", "work", now, today_date, None)
        )
        self.connection.commit()
        cursor.close()

        result = todo.today(self.connection, self.test_userid)
        
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["item"], "My task today")
        
        # Verify other user's task exists
        cursor = self.connection.cursor()
        cursor.execute(
            "SELECT COUNT(*) FROM ToDoData WHERE userid = %s AND item = %s",
            ("other_test_user", "Other user task today")
        )
        count = cursor.fetchone()[0]
        cursor.close()
        self.assertEqual(count, 1)
        
        # Cleanup other user's data
        cursor = self.connection.cursor()
        cursor.execute("DELETE FROM ToDoData WHERE userid = %s", ("other_test_user",))
        self.connection.commit()
        cursor.close()

    def test_today_with_different_times_same_date(self):
        """Test that today() returns tasks due today regardless of time"""
        now = datetime.now()
        today_date = now.date()
        
        cursor = self.connection.cursor()
        # Task due early morning today
        cursor.execute(
            "INSERT INTO ToDoData (userid, item, type, started, due, done) VALUES (%s, %s, %s, %s, %s, %s)",
            (self.test_userid, "Morning task", "work", now, 
             datetime.combine(today_date, datetime.min.time().replace(hour=8)), None)
        )
        # Task due late evening today
        cursor.execute(
            "INSERT INTO ToDoData (userid, item, type, started, due, done) VALUES (%s, %s, %s, %s, %s, %s)",
            (self.test_userid, "Evening task", "personal", now,
             datetime.combine(today_date, datetime.min.time().replace(hour=23, minute=59)), None)
        )
        self.connection.commit()
        cursor.close()

        result = todo.today(self.connection, self.test_userid)
        
        self.assertEqual(len(result), 2)
        task_items = [task["item"] for task in result]
        self.assertIn("Morning task", task_items)
        self.assertIn("Evening task", task_items)

    def test_today_with_null_due_dates(self):
        """Test that today() ignores tasks with null due dates"""
        now = datetime.now()
        today_date = now.date()
        
        cursor = self.connection.cursor()
        # Task with due date today
        cursor.execute(
            "INSERT INTO ToDoData (userid, item, type, started, due, done) VALUES (%s, %s, %s, %s, %s, %s)",
            (self.test_userid, "Task with due date", "work", now, today_date, None)
        )
        # Task with null due date
        cursor.execute(
            "INSERT INTO ToDoData (userid, item, type, started, due, done) VALUES (%s, %s, %s, %s, %s, %s)",
            (self.test_userid, "Task without due date", "personal", now, None, None)
        )
        self.connection.commit()
        cursor.close()

        result = todo.today(self.connection, self.test_userid)
        
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["item"], "Task with due date")

    def test_today_return_format(self):
        """Test that today() returns list of dictionaries with correct keys"""
        now = datetime.now()
        today_date = now.date()
        
        cursor = self.connection.cursor()
        cursor.execute(
            "INSERT INTO ToDoData (userid, item, type, started, due, done) VALUES (%s, %s, %s, %s, %s, %s)",
            (self.test_userid, "Format test task", "work", now, today_date, None)
        )
        self.connection.commit()
        cursor.close()

        result = todo.today(self.connection, self.test_userid)
        
        self.assertEqual(len(result), 1)
        task = result[0]
        
        # Check that all expected keys are present
        expected_keys = {"item", "type", "started", "due", "done"}
        self.assertEqual(set(task.keys()), expected_keys)
        
        # Check data types and values
        self.assertEqual(task["item"], "Format test task")
        self.assertEqual(task["type"], "work")
        self.assertIsNotNone(task["started"])
        self.assertIsNotNone(task["due"])
        self.assertIsNone(task["done"])


################################################################################
# Tests for tomorrow() function - BY AVA
# TODO: Implement in Issue #9
################################################################################

def test_tomorrow_placeholder_mock(mock_connection):
    """Placeholder - TODO: Implement mock tests"""
    pass

class TestTomorrowIntegration(unittest.TestCase):
    """Integration tests for tomorrow() function with real database"""

    def setUp(self):
        """Setup: Connect to database"""
        self.connection = todo.get_db_connection()
        self.assertIsNotNone(self.connection, "Failed to connect to database")
        self.test_userid = "test_tomorrow_user"
        self.cleanup()
        logger.info("Database connected for tomorrow() integration test")

    def tearDown(self):
        """Teardown: Clean up test data"""
        self.cleanup()
        if self.connection:
            self.connection.close()
        logger.info("Database disconnected")

    def cleanup(self):
        """Remove all test data"""
        try:
            cursor = self.connection.cursor()
            cursor.execute("DELETE FROM ToDoData WHERE userid = %s", (self.test_userid,))
            self.connection.commit()
            cursor.close()
        except:
            pass

    def test_tomorrow_placeholder_integration(self):
        """Placeholder - TODO: Implement real DB tests"""
        pass

################################################################################
# INTEGRATION TESTS WITH REAL DATABASE (Thorough, catches SQL errors)
# Tested by: Krish
################################################################################

class TestAddIntegration(unittest.TestCase):
    """Integration tests for add() function with real database"""

    def setUp(self):
        """Setup: Connect to real database before each test"""
        self.connection = todo.get_db_connection()
        self.assertIsNotNone(self.connection, "Failed to connect to database")
        self.test_userid = "test_add_user"
        self.cleanup()
        logger.info("Database connected for integration test")

    def tearDown(self):
        """Teardown: Clean up test data"""
        self.cleanup()
        if self.connection:
            self.connection.close()
        logger.info("Database disconnected")

    def test_add_placeholder_integration(self):
        """Placeholder - TODO: Implement real DB tests in Issue #9"""
        # TODO: Test add() with real database
        # TODO: Verify data actually inserted with SELECT query
        # TODO: Clean up test data
        pass

    def cleanup(self):
        """Remove all test data"""
        try:
            cursor = self.connection.cursor()
            cursor.execute("DELETE FROM ToDoData WHERE userid = %s", (self.test_userid,))
            self.connection.commit()
            cursor.close()
        except:
            pass

    def test_add_basic_integration(self):
        """Test adding a task actually inserts into database"""
        result = todo.add(self.connection, self.test_userid, "Integration test task")
        self.assertTrue(result)
        
        # Verify it was inserted
        cursor = self.connection.cursor()
        cursor.execute(
            "SELECT item FROM ToDoData WHERE userid = %s AND item = %s",
            (self.test_userid, "Integration test task")
        )
        row = cursor.fetchone()
        cursor.close()
        
        self.assertIsNotNone(row)
        self.assertEqual(row[0], "Integration test task")

    def test_add_with_all_fields_integration(self):
        """Test adding task with all fields"""
        started = datetime(2024, 12, 1, 10, 0)
        due = datetime(2024, 12, 25, 23, 59)
        
        result = todo.add(
            self.connection,
            self.test_userid,
            "Complete task",
            type_val="work",
            started=started,
            due=due
        )
        self.assertTrue(result)
        
        # Verify all fields were saved
        cursor = self.connection.cursor()
        cursor.execute(
            "SELECT item, type, started, due FROM ToDoData WHERE userid = %s AND item = %s",
            (self.test_userid, "Complete task")
        )
        row = cursor.fetchone()
        cursor.close()
        
        self.assertIsNotNone(row)
        self.assertEqual(row[0], "Complete task")
        self.assertEqual(row[1], "work")
        self.assertIsNotNone(row[2])  # started
        self.assertIsNotNone(row[3])  # due

    def test_add_duplicate_integration(self):
        """Test that duplicate tasks are prevented"""
        # Add first task
        result1 = todo.add(self.connection, self.test_userid, "Duplicate test")
        self.assertTrue(result1)
        
        # Try to add duplicate
        result2 = todo.add(self.connection, self.test_userid, "Duplicate test")
        self.assertFalse(result2)  # Should return False on duplicate

    def test_add_userid_isolation_integration(self):
        """Test that tasks are isolated by userid"""
        # Add task for user1
        result1 = todo.add(self.connection, self.test_userid, "Task A")
        self.assertTrue(result1)
        
        # Add same task name for different user
        result2 = todo.add(self.connection, "other_user", "Task A")
        self.assertTrue(result2)
        
        # Verify both exist
        cursor = self.connection.cursor()
        cursor.execute("SELECT COUNT(*) FROM ToDoData WHERE item = %s", ("Task A",))
        count = cursor.fetchone()[0]
        cursor.close()
        
        self.assertEqual(count, 2)
        
        # Cleanup other user
        cursor = self.connection.cursor()
        cursor.execute("DELETE FROM ToDoData WHERE userid = %s", ("other_user",))
        self.connection.commit()
        cursor.close()

class TestUpdateIntegration(unittest.TestCase):
    """Integration tests for update() function with real database"""

    def setUp(self):
        """Setup: Connect to database and insert test task"""
        self.connection = todo.get_db_connection()
        self.assertIsNotNone(self.connection, "Failed to connect to database")
        self.test_userid = "test_update_user"
        self.cleanup()
        
        # Insert a task to update
        todo.add(self.connection, self.test_userid, "Task to update", type_val="initial")
        logger.info("Database connected for update() integration test")

    def tearDown(self):
        """Teardown: Clean up test data"""
        self.cleanup()
        if self.connection:
            self.connection.close()
        logger.info("Database disconnected")

    def cleanup(self):
        """Remove all test data"""
        try:
            cursor = self.connection.cursor()
            cursor.execute("DELETE FROM ToDoData WHERE userid = %s", (self.test_userid,))
            self.connection.commit()
            cursor.close()
        except:
            pass

    def test_update_type_integration(self):
        """Test updating task type field"""
        result = todo.update(
            self.connection,
            self.test_userid,
            "Task to update",
            type_val="updated_type"
        )
        self.assertTrue(result)
        
        # Verify update
        cursor = self.connection.cursor()
        cursor.execute(
            "SELECT type FROM ToDoData WHERE userid = %s AND item = %s",
            (self.test_userid, "Task to update")
        )
        row = cursor.fetchone()
        cursor.close()
        
        self.assertEqual(row[0], "updated_type")

    def test_update_dates_integration(self):
        """Test updating date fields"""
        new_due = datetime(2025, 1, 1, 12, 0)
        new_done = datetime(2024, 12, 30, 15, 30)
        
        result = todo.update(
            self.connection,
            self.test_userid,
            "Task to update",
            due=new_due,
            done=new_done
        )
        self.assertTrue(result)
        
        # Verify update
        cursor = self.connection.cursor()
        cursor.execute(
            "SELECT due, done FROM ToDoData WHERE userid = %s AND item = %s",
            (self.test_userid, "Task to update")
        )
        row = cursor.fetchone()
        cursor.close()
        
        self.assertIsNotNone(row[0])  # due
        self.assertIsNotNone(row[1])  # done

    def test_update_nonexistent_integration(self):
        """Test updating task that doesn't exist"""
        with self.assertRaises(ValueError):
            todo.update(
                self.connection,
                self.test_userid,
                "Nonexistent task",
                type_val="test"
            )

    def test_update_userid_isolation_integration(self):
        """Test that update only affects correct userid"""
        # Add task for different user
        todo.add(self.connection, "other_user", "Task to update", type_val="original")
        
        # Update for test user (should not affect other user's task)
        result = todo.update(
            self.connection,
            self.test_userid,
            "Task to update",
            type_val="updated"
        )
        self.assertTrue(result)
        
        # Verify other user's task unchanged
        cursor = self.connection.cursor()
        cursor.execute(
            "SELECT type FROM ToDoData WHERE userid = %s AND item = %s",
            ("other_user", "Task to update")
        )
        row = cursor.fetchone()
        cursor.close()
        
        self.assertEqual(row[0], "original")
        
        # Cleanup
        cursor = self.connection.cursor()
        cursor.execute("DELETE FROM ToDoData WHERE userid = %s", ("other_user",))
        self.connection.commit()
        cursor.close()

    def test_delete_placeholder_integration(self):
        """Placeholder - TODO: Implement real DB tests in Issue #9"""
        # TODO: Insert test data
        # TODO: Test delete() with real database
        # TODO: Verify deletion with SELECT query
        pass

    def test_next_placeholder_integration(self):
        """Placeholder - TODO: Implement real DB tests in Issue #9"""
        # TODO: Insert multiple test tasks with different due dates
        # TODO: Test next() returns earliest due task
        # TODO: Clean up test data
        pass

    def test_today_placeholder_integration(self):
        """Placeholder - TODO: Implement real DB tests in Issue #9"""
        # TODO: Insert tasks with today's date
        # TODO: Test today() returns correct tasks
        # TODO: Clean up test data
        pass

    def test_tomorrow_placeholder_integration(self):
        """Placeholder - TODO: Implement real DB tests in Issue #9"""
        # TODO: Insert tasks with tomorrow's date
        # TODO: Test tomorrow() returns correct tasks
        # TODO: Clean up test data
        pass

if __name__ == '__main__':
    # Run pytest for unit tests
    pytest.main([__file__, '-v'])
    # Run unittest for integration tests
    unittest.main()
