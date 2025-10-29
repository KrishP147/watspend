# Test Report - To-Do Application
**Team 10** | **Lab 5**  
**Test Execution Date:** October 29 2025
**Report Generated:** October 29 2025

---

## Executive Summary

**Overall Result:** ✅ PASS (Partial - 2/6 functions complete)  
**Total Tests:** 28  
**Passed:** 28  
**Failed:** 0  
**Pass Rate:** 100%  
**Code Coverage:** 42%

Functions add() and update() have been fully tested and are passing all tests. Remaining 4 functions (delete, next, today, tomorrow) have placeholder tests.

---

## 1. Test Execution Summary

| Function | Unit Tests | Integration Tests | Total | Passed | Failed | Pass Rate | Tested By |
|----------|------------|-------------------|-------|--------|--------|-----------|-----------|
| add()    | 5          | 4                 | 9     | 9      | 0      | 100%      | Krish     |
| update() | 6          | 4                 | 10    | 10     | 0      | 100%      | Krish     |
| delete() | 1          | 4                 | 5     | 5      | 0      | 100%      | Pending   |
| next()   | 1          | 1                 | 2     | 2      | 0      | 100%      | Pending   |
| today()  | 1          | 1                 | 2     | 2      | 0      | 100%      | Pending   |
| tomorrow() | 1        | 1                 | 2     | 2      | 0      | 100%      | Pending   |
| **TOTAL** | **15**    | **15**            | **28** | **28** | **0**  | **100%**  | -         |

*Note: delete, next, today, tomorrow currently have placeholder tests*

---

## 2. Detailed Test Results

### 2.1 add() Function
**Tested by:** Krish  
**Total Tests:** 9  
**Pass Rate:** 100%  
**Coverage:** Estimated 85%+

**Unit Test Results:**
| Test ID | Test Name | Status | Duration | Notes |
|---------|-----------|--------|----------|-------|
| UT-ADD-01 | test_add_basic_success | ✅ PASS | <50ms | Basic task addition works |
| UT-ADD-02 | test_add_with_all_parameters | ✅ PASS | <50ms | All optional fields handled |
| UT-ADD-03 | test_add_duplicate_task | ✅ PASS | <50ms | Duplicate detection working |
| UT-ADD-04 | test_add_sql_error | ✅ PASS | <50ms | Error handling correct |
| UT-ADD-05 | test_add_userid_isolation | ✅ PASS | <50ms | Userid filtering verified |

**Integration Test Results:**
| Test ID | Test Name | Status | Duration | Notes |
|---------|-----------|--------|----------|-------|
| IT-ADD-01 | test_add_basic_integration | ✅ PASS | ~70ms | Database insertion verified |
| IT-ADD-02 | test_add_with_all_fields_integration | ✅ PASS | ~70ms | All fields persist correctly |
| IT-ADD-03 | test_add_duplicate_integration | ✅ PASS | ~70ms | Duplicate prevention in DB |
| IT-ADD-04 | test_add_userid_isolation_integration | ✅ PASS | ~70ms | User isolation confirmed |

**Issues Found:** 0  
**Resolution:** N/A - All tests passing

---

### 2.2 update() Function
**Tested by:** Krish  
**Total Tests:** 10  
**Pass Rate:** 100%  
**Coverage:** Estimated 90%+

**Unit Test Results:**
| Test ID | Test Name | Status | Duration | Notes |
|---------|-----------|--------|----------|-------|
| UT-UPD-01 | test_update_basic_success | ✅ PASS | <50ms | Basic update works |
| UT-UPD-02 | test_update_nonexistent_task | ✅ PASS | <50ms | ValueError raised correctly |
| UT-UPD-03 | test_update_multiple_fields | ✅ PASS | <50ms | Multiple field updates work |
| UT-UPD-04 | test_update_no_fields | ✅ PASS | <50ms | Returns False when no updates |
| UT-UPD-05 | test_update_userid_filtering | ✅ PASS | <50ms | Userid in WHERE clause |
| UT-UPD-06 | test_update_sql_error | ✅ PASS | <50ms | SQL errors handled |

**Integration Test Results:**
| Test ID | Test Name | Status | Duration | Notes |
|---------|-----------|--------|----------|-------|
| IT-UPD-01 | test_update_type_integration | ✅ PASS | ~70ms | Type field updates in DB |
| IT-UPD-02 | test_update_dates_integration | ✅ PASS | ~70ms | Date fields update correctly |
| IT-UPD-03 | test_update_nonexistent_integration | ✅ PASS | ~70ms | ValueError on missing task |
| IT-UPD-04 | test_update_userid_isolation_integration | ✅ PASS | ~70ms | User isolation maintained |

**Issues Found:** 1 (Resolved)  
**Issue:** SQL reserved word "type" causing syntax error  
**Resolution:** Changed to \`type\` with backticks in SQL queries

---

### 2.3 delete() Function
**Tested by:** Pending  
**Total Tests:** 5 (placeholders)  
**Pass Rate:** 100% (placeholders)  
**Coverage:** 0%

**Status:** Awaiting implementation by Elaine

---

### 2.4 next() Function
**Tested by:** Pending  
**Total Tests:** 2 (placeholders)  
**Pass Rate:** 100% (placeholders)  
**Coverage:** 0%

**Status:** Awaiting implementation by Shiman

---

### 2.5 today() Function
**Tested by:** Pending  
**Total Tests:** 2 (placeholders)  
**Pass Rate:** 100% (placeholders)  
**Coverage:** 0%

**Status:** Awaiting implementation by Liron

---

### 2.6 tomorrow() Function
**Tested by:** Pending  
**Total Tests:** 2 (placeholders)  
**Pass Rate:** 100% (placeholders)  
**Coverage:** 0%

**Status:** Awaiting implementation by Ava

---

## 3. Code Coverage Analysis

### 3.1 Overall Coverage
```
Name                Stmts   Miss  Cover   Missing
-------------------------------------------------
src/code.py           172     99    42%    [various lines]
src/app.py              7      7     0%    [not tested yet]
-------------------------------------------------
TOTAL                 179    106    41%
```

### 3.2 Coverage by Function
| Function | Statements | Covered | Coverage | Status |
|----------|------------|---------|----------|--------|
| add()    | ~25        | ~21     | ~85%     | ✅ Good |
| update() | ~30        | ~27     | ~90%     | ✅ Excellent |
| delete() | ~20        | 0       | 0%       | ⏳ Pending |
| next()   | ~15        | ~8      | ~50%     | ⏳ Partial |
| today()  | ~18        | ~10     | ~55%     | ⏳ Partial |
| tomorrow() | ~18      | ~10     | ~55%     | ⏳ Partial |

**Coverage Goal:** >80%  
**Actual Coverage:** 42%  
**Goal Met:** ❌ Not yet (In progress - 2/6 functions complete)

---

## 4. Performance Metrics

| Metric | Value |
|--------|-------|
| Total test execution time | 0.81 seconds |
| Average test duration | ~29ms |
| Slowest test | Integration tests (~70ms avg) |
| Fastest test | Mock unit tests (<50ms avg) |

---

## 5. Issues and Bugs

### 5.1 Critical Issues
0 critical issues found.

### 5.2 Minor Issues
1 minor issue found and resolved.

| Issue ID | Description | Function | Status | Resolution |
|----------|-------------|----------|--------|------------|
| BUG-001  | SQL syntax error with "type" reserved word | update() | ✅ RESOLVED | Changed to \`type\` with backticks |

---

## 6. Test Environment

**Hardware:**
- Processor: Various (team members' machines)
- RAM: 8-16GB
- OS: Windows 11

**Software:**
- Python: 3.13.2
- pytest: 8.4.2
- pymysql: 1.1.2
- Database: MySQL (version on riku.shoshin.uwaterloo.ca)

**Database:**
- Host: riku.shoshin.uwaterloo.ca
- Database: SE101_Team_10
- Connection: ✅ Successful

---

## 7. Recommendations

### 7.1 Code Improvements
1. ✅ Fixed: Use backticks for SQL reserved words like \`type\`
2. Continue implementing remaining functions (delete, next, today, tomorrow)
3. Add more edge case testing once basic tests are complete

### 7.2 Test Improvements
1. ✅ Completed: Structure tests using TestCase classes for better organization
2. Team members should follow established test template for consistency
3. Increase coverage to >80% by completing tests for all 6 functions

---

## 8. Conclusion

The testing infrastructure is well-established and functioning correctly. Both add() and update() functions are fully tested with 100% pass rates and good coverage. The test framework successfully combines:
- Fast unit tests with mocks for rapid development
- Integration tests with real database for thorough validation
- Proper setup/teardown for database cleanup
- Good separation of test users to avoid interference

The project is on track. Once the remaining 4 functions are tested by team members, we expect to achieve >80% code coverage and have a fully validated application ready for deployment.

**Project Status:** ✅ READY for continued development  
**Recommendation:** APPROVE infrastructure, continue with remaining function tests

---

## Appendices

### Appendix A: Test Execution Logs
See `todo.log` for complete execution logs. Key excerpts show:
- Successful database connections
- Proper task insertions and updates
- Correct error handling for duplicates
- Clean teardown and data cleanup

### Appendix B: Coverage Report
See `htmlcov/index.html` for detailed coverage report showing line-by-line coverage of tested functions.

### Appendix C: Test Artifacts
- Test code: `tests/test_code.py`
- Coverage report: `htmlcov/`
- Test logs: `todo.log`
- Test plan: `docs/test_plan.md`

---

**Report Prepared by:** Krish  
**Reviewed by:** Pending  
**Approved by:** Pending  
**Date:** October 29 2025 
**Version:** 1.0 (Partial Completion)