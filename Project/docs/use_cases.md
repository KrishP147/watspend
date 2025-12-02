# Use Cases - WatSpend (WatCard Dashboard)

**Last Updated**: December 2, 2025

---

## UC-001: User Login with Google OAuth

**Actor**: Student  
**Goal**: Authenticate and access dashboard  
**Status**: ✅ Implemented

**Preconditions**:
- User has Google account
- Not currently logged in

**Main Flow**:
1. User navigates to https://watspend.vercel.app
2. System shows "Sign in with Google" button
3. User clicks button
4. System redirects to Google OAuth
5. User enters credentials (if needed)
6. User grants permissions
7. Google redirects back with auth code
8. System exchanges code for access token
9. System retrieves email and profile
10. System checks if user exists:
    - Exists: Load user settings from server
    - New: Create user record with default settings
11. System creates JWT session token
12. System redirects to dashboard
13. Dashboard shows greeting with user email

**Postconditions**:
- User authenticated
- Session token stored in localStorage
- User settings (views, labels, budgets) loaded from server
- Can access protected features

**Exceptions**:
- **E1: User denies permission** → Show message, stay on login
- **E2: Network error** → Show "Try again", stay on login
- **E3: Invalid token** → Show error, restart login

---

## UC-002: Scrape WatCard Transactions

**Actor**: Student (with extension)  
**Goal**: Import transaction history automatically  
**Status**: ✅ Implemented

**Preconditions**:
- Logged into WatCard website
- Extension installed and loaded
- Authenticated with WatSpend dashboard
- On WatCard transactions page

**Main Flow**:
1. User logs into WatCard portal
2. User navigates to transaction history page
3. User clicks WatSpend extension icon
4. Extension popup opens showing "Scrape Transactions" button
5. User clicks "Scrape Transactions"
6. Extension shows loading spinner
7. Content script scans DOM for transaction table
8. For each row: Extract date, time, terminal, amount, balance
9. Extension also extracts current Meal Plan and Flex balances
10. Extension converts to JSON format
11. Extension retrieves auth token from localStorage
12. Extension POSTs to `/api/watcard/sync`
13. Backend validates token and processes transactions
14. For each transaction:
    - Generate stable ID from datetime + amount + terminal
    - Check for duplicates
    - Store in database
15. Backend returns: `{imported: X, duplicates: Y}`
16. Extension shows success message
17. Dashboard automatically updates with new transactions

**Postconditions**:
- New transactions stored in database
- Balances (Meal Plan + Flex) updated
- Dashboard reflects new data
- No duplicates created

**Exceptions**:
- **E1: Page structure changed** → Error: "Unable to read transactions"
- **E2: Network error** → Show retry option
- **E3: Session expired** → Prompt user to log in again
- **E4: Not on WatCard page** → Show instructions

---

## UC-003: View Spending Dashboard

**Actor**: Authenticated Student  
**Goal**: View comprehensive spending overview  
**Status**: ✅ Implemented

**Preconditions**:
- User logged in
- Dashboard page loaded

**Main Flow**:
1. User navigates to dashboard (default tab)
2. System retrieves user's transactions and settings
3. System displays 6 balance cards:
   - Meal Plan Left / Meal Plan Spent
   - Flex Left / Flex Spent
   - Total Left / Total Spent
4. System renders spending breakdown:
   - Pie chart showing spending by label
   - Bar chart showing spending over time
5. User can select time range (Day, Week, Month, Year, All)
6. User can switch views (By Location / Meal Plan vs Flex)
7. Charts update interactively when filters change
8. Budget widget shows progress if budget is set
9. Recent transactions list displayed

**Postconditions**:
- Dashboard fully rendered
- Charts interactive
- Data accurate to selected filters

**Exceptions**:
- **E1: No transactions** → Show welcome message, prompt to import
- **E2: Loading error** → Show error with refresh option

---

## UC-004: Create and Manage Budgets

**Actor**: Authenticated Student  
**Goal**: Set spending limits and track progress  
**Status**: ✅ Implemented

**Preconditions**:
- User logged in
- On Goals page

**Main Flow**:
1. User clicks "Create Budget" button
2. System displays budget creation form
3. User selects budget type:
   - **Static**: Fixed amount per period (day/week/month/year)
   - **Dynamic**: Auto-calculate based on remaining balance and end date
4. User selects money type (Meal Plan or Flex)
5. User enters budget details:
   - Name
   - Amount (static) or End Date (dynamic)
   - Period
6. User clicks "Save Budget"
7. System validates input
8. System saves budget to server
9. Budget widget appears on dashboard
10. User can allocate budget portions to specific labels

**Alternative Flow - Edit Budget**:
1. User clicks edit on existing budget
2. Form pre-fills with current values
3. User modifies and saves

**Alternative Flow - Delete Budget**:
1. User clicks delete on budget
2. System confirms deletion
3. Budget removed from server

**Postconditions**:
- Budget saved to server
- Progress tracking active
- Label allocations saved

**Exceptions**:
- **E1: Invalid input** → Highlight field with error
- **E2: Save failed** → Show error, keep form data

---

## UC-005: Manage Transaction Labels

**Actor**: Authenticated Student  
**Goal**: Organize transactions with labels  
**Status**: ✅ Implemented

**Preconditions**:
- User logged in
- Has transactions
- On Transactions page

**Main Flow**:
1. User views transaction list
2. Each transaction shows current label assignment
3. User clicks label dropdown on a transaction
4. System shows available labels for current view:
   - "By Location" view: Location-based labels (SLC, DC, V1, etc.)
   - "Meal Plan vs Flex" view: Meal Plan, Flex Dollars, Other
5. User selects new label
6. System updates transaction's label for this view
7. System saves mapping to server (debounced)
8. Dashboard charts update to reflect change

**Label Auto-Generation**:
- When new terminal IDs are detected, system auto-creates labels
- Labels are view-specific
- Mappings persist across sessions

**Postconditions**:
- Transaction label updated
- Mapping saved to server
- Charts reflect new categorization

---

## UC-006: Export Transactions to CSV

**Actor**: Authenticated Student  
**Goal**: Download transaction data for external analysis  
**Status**: ✅ Implemented

**Preconditions**:
- User logged in
- Has transactions

**Main Flow**:
1. User clicks "Export" button (Dashboard or Transactions page)
2. System opens export dialog
3. User selects filter options:
   - Filter by current view (checkbox)
   - Filter by current time range (checkbox)
4. System shows preview: "X transactions will be exported"
5. User clicks "Export CSV"
6. System prepares CSV with columns:
   - Transaction #, Date, Time, Amount, Label, Terminal, Type, Note
7. Browser downloads file: `WatSpend_Export_[view]_[range]_[date].csv`
8. Dialog closes

**Postconditions**:
- CSV file downloaded
- Data formatted for Excel/Google Sheets compatibility

---

## UC-007: View Goals and Reports

**Actor**: Authenticated Student  
**Goal**: Track spending progress and analyze patterns  
**Status**: ✅ Implemented

**Preconditions**:
- User logged in
- On Goals page

**Main Flow**:
1. User navigates to Goals tab
2. System displays:
   - Active budgets with progress bars
   - Label performance (spent vs allocated per label)
   - Period comparison charts (last 5 periods)
   - Trophy cabinet (achievements)
3. User can expand budget details to see:
   - Daily/weekly/monthly breakdown
   - Label-by-label performance
   - Over/under budget status
4. User can switch time period for comparison

**Postconditions**:
- Goals overview displayed
- Progress tracking visible
- Historical comparison available

---

## UC-008: Configure Settings

**Actor**: Authenticated Student  
**Goal**: Customize app preferences  
**Status**: ✅ Implemented

**Preconditions**:
- User logged in
- On Settings page

**Main Flow**:
1. User navigates to Settings tab
2. System displays current settings:
   - Account info (logged in email)
   - Theme toggle (Light/Dark)
   - Currency selector (9 options)
   - Manual balance adjustment
   - Reset data option
3. User modifies settings
4. Changes apply immediately
5. Settings persist to server

**Settings Options**:
- **Theme**: Light or Dark mode
- **Currency**: CAD, USD, EUR, GBP, JPY, CNY, INR, AUD, KRW
- **Manual Balance**: Override Meal Plan or Flex balance
- **Reset Data**: Clear all transactions and restore defaults
- **Log Out**: End session
- **Delete Account**: Remove all data permanently

**Postconditions**:
- Settings saved
- UI updates immediately
- Preferences persist across sessions

---

## Use Case Summary

| ID | Use Case | Priority | Status |
|----|----------|----------|--------|
| UC-001 | Login with Google | High | ✅ Complete |
| UC-002 | Scrape Transactions | High | ✅ Complete |
| UC-003 | View Dashboard | High | ✅ Complete |
| UC-004 | Create/Manage Budgets | High | ✅ Complete |
| UC-005 | Manage Transaction Labels | High | ✅ Complete |
| UC-006 | Export to CSV | Medium | ✅ Complete |
| UC-007 | View Goals/Reports | Medium | ✅ Complete |
| UC-008 | Configure Settings | Medium | ✅ Complete |

---

## System Flow

```
                    ┌─────────────────┐
                    │   UC-001        │
                    │ Google Login    │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
    │  UC-002     │  │  UC-003     │  │  UC-008     │
    │  Scrape     │  │  Dashboard  │  │  Settings   │
    │Transactions │  │   View      │  │             │
    └──────┬──────┘  └──────┬──────┘  └─────────────┘
           │                │
           │    ┌───────────┴───────────┐
           │    │                       │
           ▼    ▼                       ▼
    ┌─────────────┐              ┌─────────────┐
    │  UC-005     │              │  UC-004     │
    │  Manage     │              │  Create     │
    │  Labels     │              │  Budgets    │
    └──────┬──────┘              └──────┬──────┘
           │                            │
           └──────────┬─────────────────┘
                      │
           ┌──────────┴──────────┐
           │                     │
           ▼                     ▼
    ┌─────────────┐       ┌─────────────┐
    │  UC-006     │       │  UC-007     │
    │  Export     │       │  Goals &    │
    │  to CSV     │       │  Reports    │
    └─────────────┘       └─────────────┘
```