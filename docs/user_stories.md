# User Stories - WatSpend (WatCard Dashboard)
**Last Updated: December 2, 2025**

---

## High Priority (Completed ✅)

### US-001: User Authentication with Google
**As a** UWaterloo student  
**I want to** log in using my Google account  
**So that** my data is secure and personalized  

**Status**: ✅ Implemented

**Acceptance Criteria:**
- ✅ "Sign in with Google" button redirects to OAuth  
- ✅ User session persists across browser sessions  
- ✅ User can log out  
- ✅ User settings persist to server (views, labels, budgets)

---

### US-002: Scrape WatCard Transactions
**As a** WatCard user  
**I want to** automatically import transactions via Chrome extension  
**So that** I don't manually enter each transaction  

**Status**: ✅ Implemented

**Acceptance Criteria:**
- ✅ Extension scrapes data when clicked  
- ✅ Data exported as JSON and sent to backend  
- ✅ All transactions captured (date, amount, vendor, location)  
- ✅ Success/error notification shown  
- ✅ Duplicate transactions prevented  
- ✅ Balance (Meal Plan + Flex) synced automatically

---

### US-003: View Spending Dashboard
**As a** student  
**I want to** see visual dashboard of my spending  
**So that** I understand where my money goes  

**Status**: ✅ Implemented

**Acceptance Criteria:**
- ✅ 6 balance cards displayed (Meal Plan Left/Spent, Flex Left/Spent, Total Left/Spent)
- ✅ Pie chart shows spending by category  
- ✅ Bar chart shows spending trends
- ✅ Total spending for selected time range shown  
- ✅ Charts are interactive (hover shows values)  
- ✅ Time range selector (Day, Week, Month, Year, All Time)

---

### US-004: View Transaction History
**As a** student  
**I want to** see list of all transactions  
**So that** I can review individual purchases  

**Status**: ✅ Implemented

**Acceptance Criteria:**
- ✅ List shows: date, time, vendor, category/label, amount  
- ✅ Sorted by date (newest first)  
- ✅ Filter by label and date range  
- ✅ Search by vendor name or note
- ✅ Pagination (50 items per page)
- ✅ Shows transaction type (Meal Plan vs Flex)

---

### US-005: Set Spending Budgets
**As a** student  
**I want to** set spending budgets  
**So that** I stay within my financial limits  

**Status**: ✅ Implemented

**Acceptance Criteria:**
- ✅ Create static budgets (fixed amount per day/week/month/year)
- ✅ Create dynamic budgets (auto-calculate based on remaining balance and end date)
- ✅ Separate budgets for Meal Plan vs Flex dollars
- ✅ Budgets can be edited or deleted anytime
- ✅ Budget settings persist to server

---

### US-006: View Budget Progress
**As a** student  
**I want to** see progress toward my budget  
**So that** I know if I'm on track  

**Status**: ✅ Implemented

**Acceptance Criteria:**
- ✅ Budget widget shows spending vs budget amount
- ✅ Progress bar with percentage
- ✅ Color coding: green (on track), yellow (warning), red (over budget)
- ✅ Shows remaining amount or over-budget amount
- ✅ Budget scales to selected time range (day/week/month/year)

---

### US-007: Multiple View System
**As a** user  
**I want to** view my spending organized in different ways  
**So that** I can analyze my spending from multiple perspectives  

**Status**: ✅ Implemented

**Acceptance Criteria:**
- ✅ "By Location" view - spending grouped by terminal/vendor location
- ✅ "Meal Plan vs Flex" view - spending separated by account type
- ✅ Each view has its own set of labels/categories
- ✅ Transaction labels persist per view
- ✅ Can switch between views easily

---

### US-008: Label Transactions
**As a** user  
**I want to** assign labels to transactions  
**So that** I can categorize my spending  

**Status**: ✅ Implemented

**Acceptance Criteria:**
- ✅ Auto-generated labels from terminal IDs (e.g., SLC, DC, V1)
- ✅ Labels shown in transaction list
- ✅ Can reassign transaction to different label
- ✅ Label assignments persist across sessions (saved to server)
- ✅ Different label assignments per view

---

## Medium Priority (Completed ✅)

### US-009: Add Manual Transaction
**As a** student  
**I want to** manually add transactions  
**So that** I have complete spending record  

**Status**: ✅ Implemented

**Acceptance Criteria:**
- ✅ Form with: date, amount, vendor, label, description  
- ✅ All fields validated  
- ✅ Appears immediately in dashboard  
- ✅ Can edit manual transactions

---

### US-010: Monthly/Goals Report
**As a** student  
**I want to** view spending reports and goal progress  
**So that** I can track progress over time  

**Status**: ✅ Implemented

**Acceptance Criteria:**
- ✅ Goals page shows all budgets and their progress
- ✅ Label performance breakdown (spent vs allocated per label)
- ✅ Period comparison (last 5 days/weeks/months/years)
- ✅ Visual charts included
- ✅ Trophy cabinet for achievements

---

### US-011: Export Transactions to CSV
**As a** student  
**I want to** export my transactions  
**So that** I can analyze them in Excel or Google Sheets  

**Status**: ✅ Implemented

**Acceptance Criteria:**
- ✅ Export button opens dialog
- ✅ Filter by view (By Location or Meal Plan vs Flex)
- ✅ Filter by time range
- ✅ Preview shows transaction count
- ✅ Downloads CSV file with all transaction details

---

### US-012: Edit/Delete Transactions
**As a** user  
**I want to** edit or delete transactions  
**So that** I can correct mistakes  

**Status**: ✅ Implemented

**Acceptance Criteria:**
- ✅ Edit button opens form with current values  
- ✅ Can change label assignment
- ✅ Dashboard updates immediately  

---

### US-013: Dark Mode
**As a** user  
**I want to** use a dark theme  
**So that** the app is easier on my eyes  

**Status**: ✅ Implemented

**Acceptance Criteria:**
- ✅ Toggle in Settings page
- ✅ All components support dark mode
- ✅ Theme preference persists

---

### US-014: Currency Conversion
**As a** student  
**I want to** view amounts in different currencies  
**So that** I can understand spending in my preferred currency  

**Status**: ✅ Implemented

**Acceptance Criteria:**
- ✅ 9 supported currencies (CAD, USD, EUR, GBP, JPY, CNY, INR, AUD, KRW)
- ✅ Currency selector in Settings
- ✅ All amounts converted throughout the app
- ✅ Live conversion rates via API

---

### US-015: Budget Label Allocations
**As a** student  
**I want to** allocate portions of my budget to specific labels  
**So that** I can track spending per category against my budget  

**Status**: ✅ Implemented

**Acceptance Criteria:**
- ✅ Allocate amounts to labels within a budget
- ✅ See label performance (spent vs allocated)
- ✅ Progress bars per label
- ✅ Over-budget warnings per label

---

### US-016: Manual Balance Adjustment
**As a** user  
**I want to** manually adjust my balance  
**So that** I can correct discrepancies with WatCard  

**Status**: ✅ Implemented

**Acceptance Criteria:**
- ✅ Separate adjustment for Meal Plan and Flex
- ✅ Warning displayed about overriding sync
- ✅ Balance updates immediately

---

### US-017: Reset Data
**As a** user  
**I want to** reset all my data  
**So that** I can start fresh  

**Status**: ✅ Implemented

**Acceptance Criteria:**
- ✅ Confirmation dialog required
- ✅ Clears all transactions and labels
- ✅ Restores default views
- ✅ Resets server-side data

---

## Low Priority (Not Implemented)

### US-018: SMS Notifications
**As a** student  
**I want** SMS notifications about spending  
**So that** I stay informed without checking dashboard  

**Status**: ❌ Not Implemented (Optional feature)

---

### US-019: Custom Views
**As a** student  
**I want to** create custom views  
**So that** I can organize spending my own way  

**Status**: ❌ Not Implemented (Future enhancement)

---

## Summary

| Priority | Total | Completed | Percentage |
|----------|-------|-----------|------------|
| High | 8 | 8 | 100% |
| Medium | 9 | 9 | 100% |
| Low | 2 | 0 | 0% |
| **Total** | **19** | **17** | **89%** |  
