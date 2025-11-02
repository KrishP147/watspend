# To-Do Application - Function Requirements
**Team 10** | **Lab 5**

---

## Database Schema

**Table: ToDoData**

| Column  | Type         | Description                     |
| ------- | ------------ | ------------------------------- |
| userid  | VARCHAR(255) | User identifier (from DB login) |
| item    | VARCHAR(255) | Task description                |
| type    | VARCHAR(255) | Task category (optional)        |
| started | DATETIME     | Start time (optional)           |
| due     | DATETIME     | Due date/time (optional)        |
| done    | DATETIME     | Completion time (optional)      |

**Primary Key:** (userid, item)

---

## Database Connection

**Function: `get_db_connection()`**

Uses `.env` file for credentials:
```
DB_HOST=riku.shoshin.uwaterloo.ca
DB_DATABASE=SE101_Team_10
DB_USER=your_userid
DB_PASSWORD=your_password
```

Returns `pymysql.Connection` object or `None` on error.

---

## Function Requirements

### 1. add(connection, userid, item, type_val=None, started=None, due=None, done=None)

**Purpose:** Insert a new task for a user.

**Requirements:**
- Check for duplicate (userid, item) - raise `ValueError` if exists
- Insert task with all provided parameters
- Use parameterized query: `INSERT INTO ToDoData VALUES (%s, %s, %s, %s, %s, %s)`
- Commit on success, rollback on error
- Log entry, success, warnings, errors

**Returns:** `True` on success

---

### 2. update(connection, userid, item, type_val=None, started=None, due=None, done=None)

**Purpose:** Modify an existing task.

**Requirements:**
- Verify task exists - raise `ValueError` if not found
- Update type, started, due, done fields
- Use parameterized query: `UPDATE ToDoData SET ... WHERE userid = %s AND item = %s`
- Commit on success, rollback on error
- Log all operations

**Returns:** `True` on success

---

### 3. delete(connection, userid, item)

**Purpose:** Remove a task.

**Requirements:**
- Verify task exists - raise `ValueError` if not found
- Delete task: `DELETE FROM ToDoData WHERE userid = %s AND item = %s`
- Commit on success, rollback on error
- Log all operations

**Returns:** `True` on success

---

### 4. next(connection, userid)

**Purpose:** Get the next task (earliest due date).

**SQL:**
```sql
SELECT item, type, started, due, done
FROM ToDoData
WHERE userid = %s AND due IS NOT NULL
ORDER BY due ASC
LIMIT 1
```

**Returns:** Dictionary `{item, type, started, due, done}` or `None` if no tasks

---

### 5. today(connection, userid)

**Purpose:** Get all tasks due today.

**SQL:**
```sql
SELECT item, type, started, due, done
FROM ToDoData
WHERE userid = %s AND DATE(due) = CURDATE()
```

**Returns:** List of dictionaries or empty list `[]`

---

### 6. tomorrow(connection, userid)

**Purpose:** Get all tasks due tomorrow.

**SQL:**
```sql
SELECT item, type, started, due, done
FROM ToDoData
WHERE userid = %s AND DATE(due) = DATE_ADD(CURDATE(), INTERVAL 1 DAY)
```

**Returns:** List of dictionaries or empty list `[]`

---

## Common Requirements (All Functions)

**Error Handling:**
- Use try-except for all database operations
- Rollback on errors
- Close cursors in `finally` blocks
- Raise `ValueError` for business logic errors
- Raise `pymysql.Error` for database errors

**SQL Injection Prevention:**
- **Always** use parameterized queries with `%s` placeholders
- **Never** use f-strings or concatenation in SQL

**Logging:**
```python
logger.info(f"function() called - userid={userid}, item={item}")
logger.warning(f"Issue: {description}")
logger.error(f"Error: {err}")
```

**User Isolation:**
- All queries **must** filter by userid: `WHERE userid = %s`
- Users can only access their own tasks

---

## Testing Requirements

**Unit Tests (pytest with mocks):**
- Fast, no real database
- Test function logic and error handling

**Integration Tests (unittest with real DB):**
- Test actual SQL queries
- Verify database state changes
- Use setup/teardown for cleanup

**Coverage Target:** > 80%

---

## Acceptance Criteria

Each function is complete when:
- ✅ Implements specification above
- ✅ Uses parameterized queries
- ✅ Has error handling with rollback
- ✅ Has logging at INFO/WARNING/ERROR levels
- ✅ Has unit tests (mocks)
- ✅ Has integration tests (real DB)
- ✅ Code reviewed and approved
- ✅ Merged to `issue-#1-todo-app-lab5`

---

## Security Note

**Current approach:** userid comes from database login credentials. Each developer uses their own account via `.env` file.

**Future:** Web-based authentication, session management, password hashing.

---