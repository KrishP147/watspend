# Test Plan - WatSpend

**Version**: 1.0  
**Last Updated**: November 2025  
**Author**: Team 10

---

## 1. Test Strategy

### 1.1 Scope
This test plan covers the WatSpend application, a comprehensive WatCard expense tracking and budgeting tool for University of Waterloo students.

**In Scope:**
- Authentication system (email/password and Google OAuth)
- Transaction management and categorization
- View-based organization (By Location, Meal Plan vs Flex)
- Budget creation and tracking (static and dynamic)
- Label allocation system
- Data persistence and synchronization
- Browser extension for automatic data scraping
- Monthly reporting and analytics
- CSV export functionality
- Dark mode theming

**Out of Scope:**
- Third-party WatCard system integration (read-only scraping only)
- Mobile native applications
- Payment processing
- SMS notifications (UI only, backend pending)

### 1.2 Test Levels

1. **Unit Tests** - Individual component/function testing
2. **Integration Tests** - API and database integration
3. **System Tests** - End-to-end user workflows
4. **UAT** - User acceptance with real students

### 1.3 Testing Tools

| Tool | Purpose | Component |
|------|---------|-----------|
| **pytest** | Unit/Integration tests | Database, Python |
| **Jest** | Unit tests | Backend (Node.js) |
| **React Testing Library** | Component tests | Frontend |
| **Manual Testing** | UI/UX validation | All components |
| **Chrome DevTools** | Extension debugging | Chrome Extension |

### 1.4 Test Data

- **Test Database**: Project_Team_10 on riku.shoshin.uwaterloo.ca
- **Test User**: User ID 57 (seclassof2030@gmail.com) with 68+ transactions
- **Sample Transactions**: Real WatCard data from team members

## 2. Test Cases

### 2.1 Authentication Tests (AUTH)

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|----------------|----------|
| AUTH-001 | User Registration | 1. Navigate to app<br>2. Click "Sign up"<br>3. Enter email/password<br>4. Submit | User created, logged in, default views created | High |
| AUTH-002 | User Login (Email) | 1. Enter email/password<br>2. Click "Sign in" | User authenticated, JWT token returned, redirected to dashboard | High |
| AUTH-003 | Google OAuth | 1. Click "Sign in with Google"<br>2. Select @uwaterloo.ca account<br>3. Authorize | User authenticated via Google, redirected to dashboard | High |
| AUTH-004 | Token Persistence | 1. Login<br>2. Close browser<br>3. Reopen app | User remains logged in (token in localStorage) | High |
| AUTH-005 | Logout | 1. Click logout button<br>2. Try accessing dashboard | Token cleared, redirected to login page | Medium |
| AUTH-006 | Invalid Credentials | 1. Enter wrong password<br>2. Submit | Error message displayed, no login | Medium |
| AUTH-007 | JWT Expiry | 1. Wait for token expiry<br>2. Make API request | Redirect to login, token refreshed | Medium |

### 2.2 Transaction & Label Tests (TXN)

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|----------------|----------|
| TXN-001 | Manual Transaction Entry | 1. Click "+ Add Transaction"<br>2. Fill amount, date, vendor<br>3. Assign label<br>4. Save | Transaction saved with warning about manual entries | High |
| TXN-002 | Label Assignment | 1. Select unlabeled transaction<br>2. Assign to label | Transaction updated, label visible in list | High |
| TXN-003 | Multi-View Labels | 1. Assign label in Location view<br>2. Switch to Meal Plan vs Flex view<br>3. Assign different label | Each view shows correct label independently | High |
| TXN-004 | Edit Transaction | 1. Click edit on transaction<br>2. Modify amount/date<br>3. Save | Changes persisted, list updated | Medium |
| TXN-005 | Delete Transaction | 1. Click delete on transaction<br>2. Confirm deletion | Transaction removed from database and UI | Medium |
| TXN-006 | Search Transactions | 1. Type in search box<br>2. Press enter | Transactions filtered by note/terminal | Medium |
| TXN-007 | Filter by Label | 1. Select label from dropdown | Only transactions with that label shown | Medium |
| TXN-008 | Pagination | 1. Navigate to page 2<br>2. Click page buttons | 50 items per page, correct navigation | Low |
| TXN-009 | Duplicate Prevention | 1. Import same transactions twice | Duplicates rejected, count shown | High |

### 2.3 Budget Tests (BUD)

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|----------------|----------|
| BUD-001 | Create Static Budget | 1. Click "Create Budget"<br>2. Select Static type<br>3. Enter amount and period<br>4. Save | Budget created, displayed on dashboard widget | High |
| BUD-002 | Create Dynamic Budget | 1. Select Dynamic type<br>2. Set end date<br>3. Enter starting balance | Daily budget auto-calculated from balance and days remaining | High |
| BUD-003 | Budget Progress Tracking | 1. Create budget<br>2. Add transactions | Progress bar updates, remaining amount shown | High |
| BUD-004 | Label Allocation | 1. Open budget on Goals page<br>2. Click Edit on label<br>3. Enter allocation amount | Allocation saved, progress bar per label | High |
| BUD-005 | Over-Budget Warning | 1. Spend more than allocated<br>2. View Goals page | Red progress bar, warning indicator | Medium |
| BUD-006 | Budget Type Filtering | 1. Create Meal Plan budget<br>2. View label allocations | Flex-only labels greyed out | Medium |
| BUD-007 | Budget Period Scaling | 1. Create monthly budget<br>2. Switch to weekly view | Amount scaled correctly (monthly/4.4) | Medium |
| BUD-008 | Edit Budget | 1. Click edit on budget<br>2. Modify amount<br>3. Save | Budget updated, progress recalculated | Medium |
| BUD-009 | Delete Budget | 1. Click delete on budget<br>2. Confirm | Budget removed, widget updates | Low |
| BUD-010 | Max Allocation Enforcement | 1. Try to allocate more than budget total | Amount capped at remaining budget | Medium |

### 2.4 Browser Extension Tests (EXT)

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|----------------|----------|
| EXT-001 | Extension Installation | 1. Load unpacked extension<br>2. Check Chrome toolbar | Extension icon visible, popup works | High |
| EXT-002 | Data Scraping | 1. Log into WatCard portal<br>2. Navigate to transactions<br>3. Click "Scrape" in extension | Transactions parsed and sent to dashboard | High |
| EXT-003 | Balance Sync | 1. Scrape from WatCard<br>2. Check dashboard balances | Meal Plan and Flex balances updated correctly | High |
| EXT-004 | Authentication Link | 1. Open extension popup<br>2. Ensure logged in | Extension uses dashboard auth token | Medium |
| EXT-005 | Error Handling | 1. Try scraping on wrong page | Friendly error message shown | Medium |

### 2.5 Dashboard Tests (DASH)

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|----------------|----------|
| DASH-001 | Balance Cards Display | 1. Login<br>2. View dashboard | 6 cards: Meal Plan Left/Spent, Flex Left/Spent, Total Left/Spent | High |
| DASH-002 | View Selector | 1. Click "By Location"<br>2. Click "Meal Plan vs Flex" | Spending breakdown updates per view | High |
| DASH-003 | Time Range Selector | 1. Select "Week"<br>2. Select "Month" | Transactions and totals filter by range | High |
| DASH-004 | Spending Breakdown Chart | 1. View dashboard with transactions | Pie/bar chart shows spending by label | Medium |
| DASH-005 | Dark Mode Toggle | 1. Go to Settings<br>2. Toggle dark mode | All components switch to dark theme | Medium |

### 2.6 Export Tests (EXP)

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|----------------|----------|
| EXP-001 | CSV Export | 1. Click Export<br>2. Select filters<br>3. Download | Valid CSV file with correct columns | High |
| EXP-002 | Filtered Export | 1. Select specific view and range<br>2. Export | Only matching transactions in CSV | Medium |
| EXP-003 | Transaction Count Preview | 1. Open export dialog<br>2. Change filters | Preview count updates | Low |

### 2.7 Database Tests (DB)

| ID | Test Case | Steps | Expected Result | Priority |
|----|-----------|-------|----------------|----------|
| DB-001 | Connection | 1. Run pytest | Database connection successful | High |
| DB-002 | Table Structure | 1. Check users table<br>2. Check transactions table | All required columns exist | High |
| DB-003 | Foreign Keys | 1. Insert transaction with invalid user_id | Foreign key constraint error | High |
| DB-004 | Unique Constraints | 1. Insert duplicate email | Unique constraint error | High |
| DB-005 | Cascade Delete | 1. Delete user<br>2. Check transactions | All user's transactions deleted | Medium |
| DB-006 | Index Performance | 1. Query by user_id<br>2. Query by email | Fast response (<100ms) | Medium |

## 3. Test Environment

### 3.1 Frontend Environment
- **OS**: Windows 10/11, macOS 12+, Ubuntu 20.04+
- **Browsers**: Chrome 120+, Firefox 120+ (dashboard only)
- **Node.js**: v18.x LTS
- **React**: v18.2
- **Vite**: v6.x

### 3.2 Backend Environment
- **Node.js**: v18.x LTS
- **Express**: v4.x
- **MySQL**: 8.0.x
- **Server Host**: localhost:4000

### 3.3 Database Environment
- **Host**: riku.shoshin.uwaterloo.ca
- **Database**: Project_Team_10
- **MySQL Version**: 8.0

### 3.4 Extension Environment
- **Chrome**: v120+
- **Manifest Version**: 3
- **Permissions**: activeTab, storage

## 4. Entry & Exit Criteria

### 4.1 Entry Criteria
- Code committed to GitLab with passing CI
- Unit tests written for new features
- Test environment available and configured
- Test data prepared

### 4.2 Exit Criteria
- All high-priority tests pass (100%)
- Medium-priority tests pass (≥90%)
- Code coverage ≥70%
- No critical or high-severity bugs open
- Performance targets met (<2s page load)
- Documentation complete

## 5. Test Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Code Coverage | ≥70% | pytest-cov, nyc |
| Pass Rate (High Priority) | 100% | Test results |
| Pass Rate (Overall) | ≥95% | Test results |
| Critical Bugs | 0 | GitLab Issues |
| Test Execution Time | <5 min | CI pipeline |
| Page Load Time | <2s | Chrome DevTools |

## 6. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| WatCard site structure changes | Medium | High | Flexible selectors, error handling |
| Database connection issues | Low | High | Connection pooling, retry logic |
| Browser compatibility | Medium | Medium | Test on Chrome primarily |
| Test data availability | Medium | Medium | Use real team member data |

## 7. Deliverables

1. **test_report.md** - Test execution results
2. **tests/test_code.py** - Python database tests
3. **Coverage reports** - Screenshot of coverage output
4. **Bug reports** - GitLab Issues with labels
5. **Test screenshots** - Evidence of manual testing

## 8. Schedule

| Phase | Dates | Activities |
|-------|-------|------------|
| Test Planning | Week 1 | Write test plan, set up environment |
| Unit Testing | Week 2-3 | Database tests, component tests |
| Integration Testing | Week 3 | API tests, extension tests |
| System Testing | Week 4 | End-to-end workflows |
| UAT & Bug Fixes | Week 4 | User testing, final fixes |

## 9. Approvals

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Test Lead | Team 10 | Nov 2025 | ✓ |
| Dev Lead | Team 10 | Nov 2025 | ✓ |
| Project Manager | Team 10 | Nov 2025 | ✓ |

---

*Test Plan v1.0 - November 2025*
