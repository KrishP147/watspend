# Test Plan - To-Do Application
**Team 10** | **Lab 5**  
**Date:** October 29 2025

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
- **Python Version:** 3.13.2
- **Dependencies:** See `build/requirements.txt`

---

## 3. Test Cases by Function

### 3.1 add() Function
**Tested by:** Krish  
**Issue:** #2  
**Status:** ✅ Complete

**Unit Tests:**
| Test ID | Test Case | Expected Result | Status |
|---------|-----------|-----------------|--------|
| UT-ADD-01 | Add task with minimal parameters | Returns True, cursor closed | ✅ PASS |
| UT-ADD-02 | Add task with all parameters | Returns True, all fields passed to SQL | ✅ PASS |
| UT-ADD-03 | Add duplicate task | Returns False, IntegrityError caught | ✅ PASS |
| UT-ADD-04 | Add with SQL error | Returns False, error logged | ✅ PASS |
| UT-ADD-05 | Add with correct userid | SQL contains correct userid parameter | ✅ PASS |

**Integration Tests:**
| Test ID | Test Case | Expected Result | Status |
|---------|-----------|-----------------|--------|
| IT-ADD-01 | Add task to database | Task appears in SELECT query | ✅ PASS |
| IT-ADD-02 | Add task with all fields | All fields saved correctly | ✅ PASS |
| IT-ADD-03 | Add duplicate task | Second add fails, only one record exists | ✅ PASS |
| IT-ADD-04 | Add tasks for different users | Both tasks exist with different userids | ✅ PASS |

**Coverage:** 9/9 tests passing (100%)

---

### 3.2 update() Function
**Tested by:** Krish  
**Issue:** #3  
**Status:** ✅ Complete

**Unit Tests:**
| Test ID | Test Case | Expected Result | Status |
|---------|-----------|-----------------|--------|
| UT-UPD-01 | Update existing task | Returns True, commit called | ✅ PASS |
| UT-UPD-02 | Update nonexistent task | Raises ValueError | ✅ PASS |
| UT-UPD-03 | Update multiple fields | All fields in UPDATE query | ✅ PASS |
| UT-UPD-04 | Update with no fields | Returns False, warning logged | ✅ PASS |
| UT-UPD-05 | Update with userid filter | SQL contains correct userid WHERE clause | ✅ PASS |
| UT-UPD-06 | Update with SQL error | Raises pymysql.Error | ✅ PASS |

**Integration Tests:**
| Test ID | Test Case | Expected Result | Status |
|---------|-----------|-----------------|--------|
| IT-UPD-01 | Update task type | Field updated in database | ✅ PASS |
| IT-UPD-02 | Update date fields | Dates saved correctly | ✅ PASS |
| IT-UPD-03 | Update nonexistent task | Raises ValueError, no changes | ✅ PASS |
| IT-UPD-04 | Update only affects correct userid | Other users' tasks unchanged | ✅ PASS |

**Coverage:** 10/10 tests passing (100%)

---

### 3.3 delete() Function
**Tested by:** Elaine  
**Issue:** #4  
**Status:** 🔄 In Progress

[To be completed by Elaine]

---

### 3.4 next() Function
**Tested by:** Shiman  
**Issue:** #5  
**Status:** 🔄 In Progress

[To be completed by Shiman]

---

### 3.5 today() Function
**Tested by:** Liron  
**Issue:** #6  
**Status:** 🔄 In Progress

[To be completed by Liron]

---

### 3.6 tomorrow() Function
**Tested by:** Ava  
**Issue:** #7  
**Status:** 🔄 In Progress

[To be completed by Ava]

---

## 4. Test Data

### 4.1 Test Users
- `test_add_user` - for add() integration tests ✅
- `test_update_user` - for update() integration tests ✅
- `test_delete_user` - for delete() integration tests
- `test_next_user` - for next() integration tests
- `test_today_user` - for today() integration tests
- `test_tomorrow_user` - for tomorrow() integration tests

### 4.2 Test Tasks
- Minimal: `{userid, item}` only
- Complete: All fields populated
- Date-based: Tasks with specific due dates
- Edge cases: Duplicate entries, nonexistent tasks

---

## 5. Test Execution

### 5.1 Running Tests

**All tests:**
```bash
cd tests
python -m pytest test_code.py -v
```

**Specific function:**
```bash
python -m pytest test_code.py -k "add" -v
python -m pytest test_code.py -k "update" -v
```

**With coverage:**
```bash
python -m pytest test_code.py --cov=../src --cov-report=html --cov-report=term -v
```

**Integration tests only:**
```bash
python -m unittest test_code.TestAddIntegration -v
python -m unittest test_code.TestUpdateIntegration -v
```

### 5.2 Success Criteria
- All tests pass (100% pass rate) ✅
- Code coverage > 80% (Current: 42%, In Progress)
- No manual database cleanup required ✅
- Tests run in < 5 seconds ✅ (0.81s)

---

## 6. Risk Analysis

| Risk | Impact | Mitigation | Status |
|------|--------|------------|--------|
| Test data not cleaned up | High | Use setUp/tearDown properly | ✅ Resolved |
| Database connection fails | High | Check .env, test connection first | ✅ Mitigated |
| Tests interfere with each other | Medium | Use unique test userids | ✅ Resolved |
| Mock tests don't catch SQL errors | Medium | Use integration tests too | ✅ Resolved |
| Python module caching | Medium | Force reload in test file | ✅ Resolved |

---

## 7. Schedule

| Activity | Owner | Deadline | Status |
|----------|-------|----------|--------|
| Write test plan | Krish | Dec 2024 | ✅ Complete |
| Implement add() tests | Krish | Dec 2024 | ✅ Complete |
| Implement update() tests | Krish | Dec 2024 | ✅ Complete |
| Implement delete() tests | Elaine | TBD | 🔄 In Progress |
| Implement next() tests | Shiman | TBD | 🔄 In Progress |
| Implement today() tests | Liron | TBD | 🔄 In Progress |
| Implement tomorrow() tests | Ava | TBD | 🔄 In Progress |
| Run all tests | All | TBD | 🔄 In Progress |
| Generate coverage report | Krish | TBD | 🔄 In Progress |
| Write test report | Krish | TBD | 🔄 In Progress |

---

## 8. Current Progress

**Completed:** 2/6 functions (33%)  
**Tests Passing:** 28/28 (100%)  
**Code Coverage:** 42%  
**Remaining Work:** 4 functions (delete, next, today, tomorrow)

---

## 9. References
- Requirements: `docs/requirements.md`
- Source code: `src/code.py`
- Test code: `tests/test_code.py`
- pytest documentation: https://docs.pytest.org/
- unittest documentation: https://docs.python.org/3/library/unittest.html

---

**Document Version:** 1.0  
**Last Updated:** October 29 2025
**Status:** In Progress