# Use Cases - WatCard Dashboard

**Last Updated**: Nov 6, 2025

---

## UC-001: User Login with Google OAuth

**Actor**: Student  
**Goal**: Authenticate and access dashboard

**Preconditions**:
- User has @uwaterloo.ca Google account
- Not currently logged in

**Main Flow**:
1. User navigates to dashboard
2. System shows "Sign in with Google" button
3. User clicks button
4. System redirects to Google OAuth
5. User enters credentials (if needed)
6. User grants permissions
7. Google redirects back with auth code
8. System exchanges code for access token
9. System retrieves email and profile
10. System checks if user exists:
    - Exists: Update last_login
    - New: Create User record
11. System creates session token
12. System redirects to dashboard
13. Dashboard shows greeting

**Postconditions**:
- User authenticated
- Session token stored
- Can access protected features

**Exceptions**:
- **E1: Non-UWaterloo email** → Show error, redirect to login
- **E2: User denies permission** → Show message, stay on login
- **E3: Network error** → Show "Try again", stay on login
- **E4: Invalid token** → Show error, restart login

---

## UC-002: Scrape WatCard Transactions

**Actor**: Student (with extension)  
**Goal**: Import transaction history automatically

**Preconditions**:
- Logged into WatCard website
- Extension installed
- Authenticated with dashboard
- On WatCard transactions page

**Main Flow**:
1. Extension detects WatCard page
2. Extension icon shows "Ready" (green)
3. User clicks extension icon
4. Extension popup opens
5. User clicks "Scrape Transactions"
6. Extension shows loading spinner
7. Content script scans DOM for transaction table
8. For each row: Extract date, time, vendor, location, amount
9. Extension validates data (required fields, valid numbers)
10. Extension converts to JSON
11. Extension retrieves session token
12. Extension POSTs to `/api/transactions/import`
13. Backend validates token
14. For each transaction:
    - Check for duplicates (watcard_transaction_id)
    - Map vendor to category
    - Insert into database
15. Backend returns: `{imported: 25, duplicates: 2}`
16. Extension shows success: "✓ Imported 25 transactions"
17. Extension shows "View Dashboard" button

**Postconditions**:
- New transactions in database
- Auto-categorized
- Dashboard updated
- No duplicates

**Exceptions**:
- **E1: Page structure changed** → Error: "Unable to read. Contact support."
- **E2: Network error** → Cache locally, show "Retry"
- **E3: Session expired** → Error: "Session expired. Please log in."
- **E4: Wrong page** → Show: "Please go to transactions page"

---

## UC-003: View Spending Dashboard

**Actor**: Authenticated Student  
**Goal**: View spending overview

**Preconditions**:
- User logged in
- Has at least 1 transaction

**Main Flow**:
1. User navigates to dashboard
2. System retrieves user's transactions
3. System calculates:
   - Total spending (current month)
   - Breakdown by category
   - Comparison to previous month
   - Progress toward goals
4. Dashboard renders:
   - **Header**: Greeting, date, quick actions
   - **Summary Cards**: Balance, total, transaction count, top category
   - **Pie Chart**: Spending by category (interactive)
   - **Line Chart**: Trends over 3 months
   - **Goal Progress**: Progress bars per category (green/yellow/red)
   - **Recent Transactions**: Last 10 transactions
   - **Insights**: Personalized messages
5. User can interact: hover charts, click for details

**Postconditions**:
- Comprehensive overview displayed
- Charts interactive
- Data accurate

**Exceptions**:
- **E1: No transactions** → Show welcome, "Import Transactions" button
- **E2: Database error** → Show "Unable to load", refresh button
- **E3: Chart fails** → Show "Chart unavailable", data in table
- **E4: Slow load (1000+ transactions)** → Show spinner, paginate

---

## UC-004: Set Monthly Spending Goal

**Actor**: Authenticated Student  
**Goal**: Define spending limits

**Preconditions**:
- User logged in
- On Goals page

**Main Flow**:
1. User clicks "Set Goals" or navigates to Goals page
2. System displays form with input per category:
   - Café: $____
   - ResHalls: $____
   - Laundry: $____
   - W Store: $____
   - Restaurants: $____
   - Other: $____
3. User enters amounts (e.g., "$200" for Café)
4. User clicks "Save Goals"
5. System validates (positive numbers, valid format)
6. System prepares data (current month-year, user ID)
7. For each category:
   - If goal exists: UPDATE amount
   - If not: INSERT new record
8. System commits to database
9. System shows "✓ Goals saved"
10. Page refreshes with progress bars

**Postconditions**:
- Goals saved for current month
- Progress bars displayed
- Can edit anytime

**Exceptions**:
- **E1: Invalid input** → Highlight field, show error, don't submit
- **E2: Database error** → Show "Unable to save", keep form data
- **E3: Large amount (>$1000)** → Show warning, require confirmation
- **E4: Session expired** → Redirect to login

---

## UC-005: Generate Monthly Report

**Actor**: Student OR System (cron)  
**Goal**: Create spending summary

**Preconditions**:
- User logged in (manual) OR month ended (auto)
- Has transactions for target month

**Main Flow**:
1. User clicks "Generate Report" OR cron runs at month-end
2. System shows "Generating..."
3. System retrieves all transactions for user + month
4. System calculates:
   - Total spending
   - Breakdown by category (amount + %)
   - Number of transactions
   - Average transaction amount
   - Most frequent vendor
5. System retrieves goals (if any)
6. System calculates goal achievement (spent vs goal)
7. System compares to previous month (% change)
8. System generates insights:
   - "You spent 15% less than September"
   - "Top category: Café ($125)"
   - "4 of 5 goals met"
9. System creates JSON for breakdown
10. System generates PDF (header, summary, charts, goals, insights)
11. System saves PDF: `/reports/user_123_2025-10.pdf`
12. System creates MonthlyReport record
13. System shows "✓ Report generated"
14. User sees: In-page HTML view + "Download PDF" button

**Postconditions**:
- Report in database
- PDF available
- Viewable anytime

**Exceptions**:
- **E1: PDF generation fails** → Save without PDF, show error, "Retry"
- **E2: Database error** → Delete PDF, show error
- **E3: No transactions** → Minimal report, "$0 spent"
- **E4: Storage full** → Save to DB without PDF, alert admin

---

## UC-006: Add Manual Transaction

**Actor**: Authenticated Student  
**Goal**: Record transaction not captured by scraping

**Preconditions**:
- User logged in
- On Dashboard or Transactions page

**Main Flow**:
1. User clicks "+ Add Transaction"
2. System opens form:
   - Date (date picker, default: today)
   - Amount ($ number input)
   - Vendor (text)
   - Category (dropdown)
   - Description (optional text)
3. User fills required fields
4. User clicks "Save Transaction"
5. System validates:
   - Date not in future
   - Amount positive, max 2 decimals
   - Vendor not empty
   - Category valid
6. System prepares Transaction record (is_manual = TRUE)
7. System inserts into database
8. System closes form
9. System shows "✓ Transaction added"
10. Transaction appears in dashboard and list

**Postconditions**:
- Manual transaction saved
- Marked as manual
- Dashboard updated

**Exceptions**:
- **E1: Invalid input** → Highlight field, show error message
- **E2: Database error** → Show "Unable to save", keep form data
- **E3: Duplicate detected** → Warning, show existing, "Save Anyway?"
- **E4: Large amount (>$1000)** → Warning, require confirmation

---

## Use Case Summary

| ID | Use Case | Priority | Complexity |
|----|----------|----------|------------|
| UC-001 | Login with Google | High | Medium |
| UC-002 | Scrape Transactions | High | High |
| UC-003 | View Dashboard | High | Medium |
| UC-004 | Set Goals | High | Low |
| UC-005 | Generate Report | Medium | High |
| UC-006 | Add Manual Transaction | Medium | Low |

---

## Dependencies

```
UC-001 (Login)
  ↓
UC-002 (Scrape) → UC-003 (Dashboard) → UC-004 (Goals)
  ↓                     ↓                    ↓
UC-006 (Manual) ────────┘                    ↓
                                              ↓
                                        UC-005 (Reports)
```