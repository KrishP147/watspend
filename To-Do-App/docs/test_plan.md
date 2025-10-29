# Test Plan - To-Do Application
**Team 10** | **Lab 5**  
**Date:** {DATE}

---

## 1. Test Objectives

### 1.1 Goals
- Verify all functions meet requirements specified in `docs/requirements.md`
- Achieve >80% code coverage
- Validate database operations work correctly
- Ensure userid isolation between users
- Confirm error handling works properly

### 1.2 Scope
**In Scope:**
- All 6 core functions: add(), update(), delete(), next(), today(), tomorrow()
- Database connection and table creation
- Error handling and logging
- User isolation

**Out of Scope:**
- Flask web interface (tested separately in Issue #8)
- Performance testing
- Security penetration testing

---

## 2. Test Strategy

### 2.1 Testing Approaches

**Unit Tests (pytest with mocks):**
- Purpose: Test function logic in isolation
- Tool: pytest with unittest.mock
- Speed: Fast (no database dependency)
- Coverage: Function logic, edge cases, error handling

**Integration Tests (unittest with real database):**
- Purpose: Test actual database operations
- Tool: unittest with real MySQL connection
- Speed: Slower (requires database)
- Coverage: SQL queries, data persistence, transactions

### 2.2 Test Environment
- **Database:** SE101_Team_10 on riku.shoshin.uwaterloo.ca
- **Test User Prefix:** test_{function}_user
- **Python Version:** 3.x
- **Dependencies:** See `build/requirements.txt`

---

## 3. Test Cases by Function

### 3.1 add() Function
**Tested by:** {TESTER_NAME}  
**Issue:** #2

**Unit Tests:**
| Test ID | Test Case | Expected Result |
|---------|-----------|-----------------|
| UT-ADD-01 | Add task with minimal parameters | Returns True, cursor closed |
| UT-ADD-02 | Add task with all parameters | Returns True, all fields passed to SQL |
| UT-ADD-03 | Add duplicate task | Returns False, IntegrityError caught |
| UT-ADD-04 | Add with SQL error | Returns False, error logged |
| UT-ADD-05 | Add with correct userid | SQL contains correct userid parameter |

**Integration Tests:**
| Test ID | Test Case | Expected Result |
|---------|-----------|-----------------|
| IT-ADD-01 | Add task to database | Task appears in SELECT query |
| IT-ADD-02 | Add task with all fields | All fields saved correctly |
| IT-ADD-03 | Add duplicate task | Second add fails, only one record exists |
| IT-ADD-04 | Add tasks for different users | Both tasks exist with different userids |

**Coverage Target:** {TARGET_PERCENTAGE}%

---

### 3.2 update() Function
**Tested by:** {TESTER_NAME}  
**Issue:** #3

**Unit Tests:**
| Test ID | Test Case | Expected Result |
|---------|-----------|-----------------|
| UT-UPD-01 | Update existing task | Returns True, commit called |
| UT-UPD-02 | Update nonexistent task | Raises ValueError |
| UT-UPD-03 | Update multiple fields | All fields in UPDATE query |
| UT-UPD-04 | Update with no fields | Returns False, warning logged |
| UT-UPD-05 | Update with userid filter | SQL contains correct userid WHERE clause |
| UT-UPD-06 | Update with SQL error | Raises pymysql.Error |

**Integration Tests:**
| Test ID | Test Case | Expected Result |
|---------|-----------|-----------------|
| IT-UPD-01 | Update task type | Field updated in database |
| IT-UPD-02 | Update date fields | Dates saved correctly |
| IT-UPD-03 | Update nonexistent task | Raises ValueError, no changes |
| IT-UPD-04 | Update only affects correct userid | Other users' tasks unchanged |

**Coverage Target:** {TARGET_PERCENTAGE}%

---

### 3.3 delete() Function
**Tested by:** {TESTER_NAME}  
**Issue:** #4

[Similar structure - filled in by Elaine]

---

### 3.4 next() Function
**Tested by:** {TESTER_NAME}  
**Issue:** #5

[Similar structure - filled in by Shiman]

---

### 3.5 today() Function
**Tested by:** {TESTER_NAME}  
**Issue:** #6

[Similar structure - filled in by Liron]

---

### 3.6 tomorrow() Function
**Tested by:** {TESTER_NAME}  
**Issue:** #7

[Similar structure - filled in by Ava]

---

## 4. Test Data

### 4.1 Test Users
- `test_add_user` - for add() integration tests
- `test_update_user` - for update() integration tests
- `test_delete_user` - for delete() integration tests
- `test_next_user` - for next() integration tests
- `test_today_user` - for today() integration tests
- `test_tomorrow_user` - for tomorrow() integration tests

### 4.2 Test Tasks
- Minimal: `{userid, item}` only
- Complete: All fields populated
- Date-based: Tasks with specific due dates
- Edge cases: Empty strings, NULL values, special characters

---

## 5. Test Execution

### 5.1 Running Tests

**All tests:**
```bash
cd tests
pytest test_code.py -v
```

**Specific function:**
```bash
pytest test_code.py::test_add_basic_success -v
```

**With coverage:**
```bash
pytest --cov=../src --cov-report=html --cov-report=term
```

**Integration tests only:**
```bash
python -m unittest test_code.TestAddIntegration -v
```

### 5.2 Success Criteria
- All tests pass (100% pass rate)
- Code coverage > {TARGET_PERCENTAGE}%
- No manual database cleanup required
- Tests run in < {TIME_LIMIT} seconds

---

## 6. Risk Analysis

| Risk | Impact | Mitigation |
|------|--------|------------|
| Test data not cleaned up | High | Use setUp/tearDown properly |
| Database connection fails | High | Check .env, test connection first |
| Tests interfere with each other | Medium | Use unique test userids |
| Mock tests don't catch SQL errors | Medium | Use integration tests too |

---

## 7. Schedule

| Activity | Owner | Deadline |
|----------|-------|----------|
| Write test plan | {COORDINATOR} | {DATE} |
| Implement add() tests | {TESTER_1} | {DATE} |
| Implement update() tests | {TESTER_2} | {DATE} |
| Implement delete() tests | {TESTER_3} | {DATE} |
| Implement next() tests | {TESTER_4} | {DATE} |
| Implement today() tests | {TESTER_5} | {DATE} |
| Implement tomorrow() tests | {TESTER_6} | {DATE} |
| Run all tests | All | {DATE} |
| Generate coverage report | {COORDINATOR} | {DATE} |
| Write test report | {COORDINATOR} | {DATE} |

---

## 8. References
- Requirements: `docs/requirements.md`
- Source code: `src/code.py`
- Test code: `tests/test_code.py`
- pytest documentation: https://docs.pytest.org/
- unittest documentation: https://docs.python.org/3/library/unittest.html

---

**Document Version:** {VERSION}  
**Last Updated:** {DATE}  
**Status:** {STATUS}