# Test Report - To-Do Application
**Team 10** | **Lab 5**  
**Test Execution Date:** {DATE}  
**Report Generated:** {DATE}

---

## Executive Summary

**Overall Result:** {PASS/FAIL}  
**Total Tests:** {TOTAL_TESTS}  
**Passed:** {PASSED_TESTS}  
**Failed:** {FAILED_TESTS}  
**Pass Rate:** {PASS_RATE}%  
**Code Coverage:** {COVERAGE}%

All {NUM_FUNCTIONS} functions have been tested and {PASS/FAIL_STATUS}.

---

## 1. Test Execution Summary

| Function | Unit Tests | Integration Tests | Total | Passed | Failed | Pass Rate | Tested By |
|----------|------------|-------------------|-------|--------|--------|-----------|-----------|
| add()    | {NUM_UT}   | {NUM_IT}          | {TOT} | {PASS} | {FAIL} | {RATE}%   | {NAME}    |
| update() | {NUM_UT}   | {NUM_IT}          | {TOT} | {PASS} | {FAIL} | {RATE}%   | {NAME}    |
| delete() | {NUM_UT}   | {NUM_IT}          | {TOT} | {PASS} | {FAIL} | {RATE}%   | {NAME}    |
| next()   | {NUM_UT}   | {NUM_IT}          | {TOT} | {PASS} | {FAIL} | {RATE}%   | {NAME}    |
| today()  | {NUM_UT}   | {NUM_IT}          | {TOT} | {PASS} | {FAIL} | {RATE}%   | {NAME}    |
| tomorrow() | {NUM_UT} | {NUM_IT}          | {TOT} | {PASS} | {FAIL} | {RATE}%   | {NAME}    |
| **TOTAL** | **{UT}** | **{IT}**          | **{T}** | **{P}** | **{F}** | **{R}%** | -      |

---

## 2. Detailed Test Results

### 2.1 add() Function
**Tested by:** {TESTER_NAME}  
**Total Tests:** {NUM_TESTS}  
**Pass Rate:** {PASS_RATE}%  
**Coverage:** {COVERAGE}%

**Unit Test Results:**
| Test ID | Test Name | Status | Duration | Notes |
|---------|-----------|--------|----------|-------|
| UT-ADD-01 | test_add_basic_success | {PASS/FAIL} | {TIME}ms | {NOTES} |
| UT-ADD-02 | test_add_with_all_parameters | {PASS/FAIL} | {TIME}ms | {NOTES} |
| UT-ADD-03 | test_add_duplicate_task | {PASS/FAIL} | {TIME}ms | {NOTES} |
| UT-ADD-04 | test_add_sql_error | {PASS/FAIL} | {TIME}ms | {NOTES} |
| UT-ADD-05 | test_add_userid_isolation | {PASS/FAIL} | {TIME}ms | {NOTES} |

**Integration Test Results:**
| Test ID | Test Name | Status | Duration | Notes |
|---------|-----------|--------|----------|-------|
| IT-ADD-01 | test_add_basic_integration | {PASS/FAIL} | {TIME}ms | {NOTES} |
| IT-ADD-02 | test_add_with_all_fields_integration | {PASS/FAIL} | {TIME}ms | {NOTES} |
| IT-ADD-03 | test_add_duplicate_integration | {PASS/FAIL} | {TIME}ms | {NOTES} |
| IT-ADD-04 | test_add_userid_isolation_integration | {PASS/FAIL} | {TIME}ms | {NOTES} |

**Issues Found:** {NUM_ISSUES}
- {ISSUE_1_DESCRIPTION}
- {ISSUE_2_DESCRIPTION}

**Resolution:** {RESOLUTION_STATUS}

---

### 2.2 update() Function
**Tested by:** {TESTER_NAME}  
**Total Tests:** {NUM_TESTS}  
**Pass Rate:** {PASS_RATE}%  
**Coverage:** {COVERAGE}%

[Similar structure for update]

---

### 2.3 delete() Function
[Filled in by Elaine]

---

### 2.4 next() Function
[Filled in by Shiman]

---

### 2.5 today() Function
[Filled in by Liron]

---

### 2.6 tomorrow() Function
[Filled in by Ava]

---

## 3. Code Coverage Analysis

### 3.1 Overall Coverage
```
Name                Stmts   Miss  Cover   Missing
-------------------------------------------------
src/code.py           {S}    {M}   {C}%    {LINES}
-------------------------------------------------
TOTAL                 {S}    {M}   {C}%
```

### 3.2 Coverage by Function
| Function | Statements | Covered | Coverage | Uncovered Lines |
|----------|------------|---------|----------|-----------------|
| add()    | {STMTS}    | {COV}   | {PCT}%   | {LINES}         |
| update() | {STMTS}    | {COV}   | {PCT}%   | {LINES}         |
| delete() | {STMTS}    | {COV}   | {PCT}%   | {LINES}         |
| next()   | {STMTS}    | {COV}   | {PCT}%   | {LINES}         |
| today()  | {STMTS}    | {COV}   | {PCT}%   | {LINES}         |
| tomorrow() | {STMTS}  | {COV}   | {PCT}%   | {LINES}         |

**Coverage Goal:** >{TARGET}%  
**Actual Coverage:** {ACTUAL}%  
**Goal Met:** {YES/NO}

---

## 4. Performance Metrics

| Metric | Value |
|--------|-------|
| Total test execution time | {TIME} seconds |
| Average test duration | {AVG_TIME}ms |
| Slowest test | {TEST_NAME} ({TIME}ms) |
| Fastest test | {TEST_NAME} ({TIME}ms) |

---

## 5. Issues and Bugs

### 5.1 Critical Issues
{NUM_CRITICAL} critical issues found.

| Issue ID | Description | Function | Status | Resolution |
|----------|-------------|----------|--------|------------|
| {ID}     | {DESC}      | {FUNC}   | {STAT} | {RES}      |

### 5.2 Minor Issues
{NUM_MINOR} minor issues found.

| Issue ID | Description | Function | Status | Resolution |
|----------|-------------|----------|--------|------------|
| {ID}     | {DESC}      | {FUNC}   | {STAT} | {RES}      |

---

## 6. Test Environment

**Hardware:**
- Processor: {PROCESSOR}
- RAM: {RAM}GB
- OS: {OS}

**Software:**
- Python: {VERSION}
- pytest: {VERSION}
- pymysql: {VERSION}
- Database: MySQL {VERSION}

**Database:**
- Host: riku.shoshin.uwaterloo.ca
- Database: SE101_Team_10
- Connection: Successful

---

## 7. Recommendations

### 7.1 Code Improvements
1. {RECOMMENDATION_1}
2. {RECOMMENDATION_2}
3. {RECOMMENDATION_3}

### 7.2 Test Improvements
1. {RECOMMENDATION_1}
2. {RECOMMENDATION_2}
3. {RECOMMENDATION_3}

---

## 8. Conclusion

{CONCLUSION_PARAGRAPH describing overall quality, readiness for deployment, any remaining concerns}

**Project Status:** {READY/NOT READY} for merge to main branch  
**Recommendation:** {APPROVE/REVISE}

---

## Appendices

### Appendix A: Test Execution Logs
```
[Paste relevant log excerpts]
```

### Appendix B: Coverage Report
See `htmlcov/index.html` for detailed coverage report.

### Appendix C: Test Artifacts
- Test code: `tests/test_code.py`
- Coverage report: `htmlcov/`
- Test logs: `todo.log`

---

**Report Prepared by:** {NAME}  
**Reviewed by:** {REVIEWER}  
**Approved by:** {APPROVER}  
**Date:** {DATE}  
**Version:** {VERSION}