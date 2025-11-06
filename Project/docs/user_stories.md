# User Stories - WatCard Meal Plan Dashboard

**Project**: WatCard Meal Plan Dashboard  
**Team**: Team 10    
**Last Updated**: Nov 5, 2025

---

## Overview

This document contains user stories for the WatCard Meal Plan Dashboard project. Each user story describes a feature from the user's perspective following the format: "As a [user type], I want [goal], so that [benefit]."

---

## User Story Priority Levels

- **High**: Must-have features for v1.0 release
- **Medium**: Should-have features if time permits
- **Low**: Nice-to-have features for future releases

---

## High Priority User Stories

### US-001: User Authentication with Google

**As a** University of Waterloo student  
**I want to** log into the dashboard using my Google account  
**So that** my spending data is secure and personalized to me

**Acceptance Criteria**:
- User sees a "Sign in with Google" button on login page
- Clicking the button redirects to Google OAuth consent screen
- After successful Google authentication, user is redirected to dashboard
- User session persists across browser sessions
- User can log out and session is cleared
- Only UWaterloo email addresses (@uwaterloo.ca) are allowed

**Priority**: High  
**Sprint**: Sprint 1 
**Owner**: Liron  
**Estimated Effort**: 8 hours

---

### US-002: Scrape WatCard Transactions

**As a** WatCard user  
**I want to** automatically import my transaction history using a Chrome extension  
**So that** I don't have to manually enter each transaction

**Acceptance Criteria**:
- Chrome extension icon appears when I'm on WatCard website
- Clicking the extension button scrapes my transaction data
- Extension shows loading indicator while scraping
- Transaction data is exported as JSON format
- JSON data is automatically sent to dashboard backend
- Extension shows success/error notification after scraping
- All transactions from the page are captured (date, amount, vendor, location)

**Priority**: High  
**Sprint**: Sprint 1  
**Owner**: Shiman  
**Estimated Effort**: 12 hours

---

### US-003: View Spending Dashboard

**As a** student tracking my finances  
**I want to** see a visual dashboard of my WatCard spending  
**So that** I can understand where my money is going at a glance

**Acceptance Criteria**:
- Dashboard displays my current WatCard balance prominently
- Pie chart shows spending breakdown by category (Café, ResHalls, Laundry, W Store, Restaurants)
- Line chart shows spending trends over the past 3 months
- Total spending for current month is displayed
- Dashboard automatically updates when new transactions are added
- Charts are interactive (hovering shows exact values)
- Dashboard is responsive and works on different screen sizes

**Priority**: High  
**Sprint**: Sprint 2  
**Owner**: Ava, Krish  
**Estimated Effort**: 10 hours

---

### US-004: View Transaction History

**As a** student  
**I want to** see a list of all my WatCard transactions  
**So that** I can review individual purchases and verify my spending

**Acceptance Criteria**:
- Transaction list displays: date, vendor, category, amount
- Transactions are sorted by date (newest first)
- User can filter transactions by category
- User can search transactions by vendor name
- User can filter by date range (this week, this month, custom range)
- List shows pagination or infinite scroll for many transactions
- Each transaction shows if it was scraped from WatCard or manually added

**Priority**: High  
**Sprint**: Sprint 2  
**Owner**: Ava  
**Estimated Effort**: 8 hours

---

### US-005: Set Monthly Spending Goals

**As a** budget-conscious student  
**I want to** set monthly spending goals for each category  
**So that** I can control my expenses and stay within my budget

**Acceptance Criteria**:
- User can set a dollar amount goal for each category (Café, ResHalls, Laundry, W Store, Restaurants)
- Goals can be set for the current month
- User can edit existing goals
- Goals automatically reset at the start of each month (optional: carry over)
- Form validates that goal amounts are positive numbers
- User receives confirmation after setting/updating goals

**Priority**: High  
**Sprint**: Sprint 2-3  
**Owner**: Ava, Krish, Elaine  
**Estimated Effort**: 8 hours

---

### US-006: View Goal Progress

**As a** student with spending goals  
**I want to** see visual progress bars showing how much of my budget I've used  
**So that** I know if I'm staying on track or overspending

**Acceptance Criteria**:
- Progress bar displayed for each category with a set goal
- Progress bar shows percentage spent (e.g., "$150 / $200 = 75%")
- Color coding: green (under 70%), yellow (70-99%), red (100%+)
- Visual indicator when goal is exceeded
- Progress bars update in real-time as transactions are added
- Dashboard shows overall budget status (all goals combined)
- User can see "X days remaining in month" near progress bars

**Priority**: High  
**Sprint**: Sprint 2-3  
**Owner**: Ava, Krish, Elaine  
**Estimated Effort**: 6 hours

---

### US-007: Categorize Transactions Automatically

**As a** dashboard user  
**I want** transactions to be automatically categorized  
**So that** I don't have to manually assign categories to each purchase

**Acceptance Criteria**:
- Transactions from Tim Hortons, campus cafés are categorized as "Café"
- Transactions from residence meal plans are categorized as "ResHalls"
- Transactions from laundry machines are categorized as "Laundry"
- Transactions from W Store (bookstore) are categorized as "W Store"
- Transactions from SLC restaurants, food courts are categorized as "Restaurants"
- Uncategorized transactions default to "Other"
- User can manually change a transaction's category if needed
- Categorization logic is documented for maintainability

**Priority**: High  
**Sprint**: Sprint 2  
**Owner**: Liron, Shiman  
**Estimated Effort**: 6 hours

---

## Medium Priority User Stories

### US-008: Add Manual Transaction

**As a** student  
**I want to** manually add transactions that weren't captured by the extension  
**So that** I have a complete record of all my spending

**Acceptance Criteria**:
- User can access "Add Transaction" form from dashboard
- Form includes fields: date, amount, category, vendor, description (optional)
- Date picker defaults to today's date
- Amount field validates positive decimal numbers
- Category dropdown includes all standard categories plus "Other"
- Form validates all required fields before submission
- After submission, transaction appears in dashboard and transaction list
- Manual transactions are clearly marked/distinguished from scraped ones

**Priority**: Medium  
**Sprint**: Sprint 2-3  
**Owner**: Elaine (form), Krish (backend)  
**Estimated Effort**: 5 hours

---

### US-009: Generate Monthly Report

**As a** student  
**I want to** generate a monthly spending report  
**So that** I can review my finances and track my progress over time

**Acceptance Criteria**:
- User can click "Generate Report" button for any past month
- Report includes: total spending, category breakdown, goal achievement status
- Report shows comparison to previous month (e.g., "You spent 15% less this month")
- Report displays visual charts (pie chart, bar chart)
- Report includes personalized insights (e.g., "Your top spending category was Café")
- Report can be viewed in dashboard or downloaded as PDF
- Reports are automatically generated at the end of each month

**Priority**: Medium  
**Sprint**: Sprint 3  
**Owner**: Elaine  
**Estimated Effort**: 10 hours

---

### US-010: View Spending Insights

**As a** student  
**I want to** see personalized insights about my spending habits  
**So that** I can make better financial decisions

**Acceptance Criteria**:
- Dashboard displays insights such as:
  - "You spent 30% less on coffee this month!"
  - "Your highest spending day was Friday ($45)"
  - "You're on track to stay within your budget"
  - "Warning: You've exceeded your Café goal by $12"
- Insights update automatically as new transactions are added
- At least 3-5 different insight types are displayed
- Insights are relevant to the user's actual spending patterns

**Priority**: Medium  
**Sprint**: Sprint 3  
**Owner**: Elaine, Krish  
**Estimated Effort**: 6 hours

---

### US-011: Edit/Delete Transactions

**As a** dashboard user  
**I want to** edit or delete transactions  
**So that** I can correct mistakes or remove duplicate entries

**Acceptance Criteria**:
- User can click "Edit" button on any transaction
- Edit form allows changing: date, amount, category, vendor, description
- User can click "Delete" button with confirmation prompt
- Deleted transactions are removed from dashboard and reports
- Edited transactions update all related charts and progress bars
- Manual transactions can be edited/deleted freely
- Scraped transactions show warning when editing (to avoid data inconsistency)

**Priority**: Medium  
**Sprint**: Sprint 3  
**Owner**: Ava, Krish  
**Estimated Effort**: 4 hours

---

### US-012: Quick Link to WatCard Website

**As a** WatCard user  
**I want** a link to the official WatCard website in my dashboard  
**So that** I can easily access my full account details when needed

**Acceptance Criteria**:
- Dashboard includes a clearly labeled "Visit WatCard Website" button/link
- Link opens WatCard website in a new tab
- Link is accessible from the main navigation or dashboard sidebar
- Link uses the official WatCard URL

**Priority**: Medium  
**Sprint**: Sprint 2  
**Owner**: Ava  
**Estimated Effort**: 1 hour

---

## Low Priority User Stories (Optional)

### US-013: Receive SMS Notifications

**As a** student  
**I want to** receive SMS notifications about my spending  
**So that** I stay informed even when I'm not checking the dashboard

**Acceptance Criteria**:
- User can opt-in to SMS notifications in settings
- User provides phone number for notifications
- User receives SMS at end of month with spending summary
- User receives SMS when a spending goal is exceeded
- User can opt-out of SMS notifications anytime
- SMS messages are concise and actionable

**Priority**: Low (Optional)  
**Sprint**: Sprint 3-4   
**Owner**: Liron  
**Estimated Effort**: 8 hours

---

### US-014: Export Data

**As a** student  
**I want to** export my transaction data to CSV or Excel  
**So that** I can analyze it in other tools or keep records

**Acceptance Criteria**:
- User can click "Export Data" button
- User can choose date range for export
- Export file includes all transaction fields: date, vendor, category, amount, description
- File downloads in CSV format
- Exported file can be opened in Excel or Google Sheets

**Priority**: Low  
**Sprint**: Sprint 4   
**Owner**: Krish  
**Estimated Effort**: 3 hours

---

### US-015: Custom Categories

**As a** student with unique spending patterns  
**I want to** create custom spending categories  
**So that** I can track expenses that don't fit standard categories

**Acceptance Criteria**:
- User can create new category with custom name
- User can assign transactions to custom categories
- Custom categories appear in all charts and reports
- User can edit or delete custom categories
- Deleting a category reassigns transactions to "Other"

**Priority**: Low  
**Sprint**: Sprint 4   
**Owner**: Krish, Ava  
**Estimated Effort**: 5 hours

---

## User Story Summary

| Priority | Count | Total Effort (hours) |
|----------|-------|---------------------|
| High | 7 | 66 hours |
| Medium | 5 | 30 hours |
| Low | 3 | 16 hours |
| **Total** | **15** | **112 hours** |

---

## User Story Map (Feature Grouping)

### Authentication & Setup
- US-001: User login with Google

### Data Collection
- US-002: Scrape WatCard transactions
- US-007: Automatic categorization
- US-008: Add manual transaction
- US-011: Edit/delete transactions

### Data Visualization
- US-003: View spending dashboard
- US-004: View transaction history
- US-010: View spending insights

### Goal Tracking
- US-005: Set monthly goals
- US-006: View goal progress

### Reporting
- US-009: Generate monthly report
- US-013: SMS notifications (optional)

### Utilities
- US-012: Link to WatCard website
- US-014: Export data (optional)
- US-015: Custom categories (optional)

---

## Notes for Development Team

1. **Prioritization**: Focus on High priority stories (US-001 through US-007) for v1.0 release
2. **Dependencies**: 
   - US-002 and US-007 should be completed before US-003 and US-004
   - US-005 must be completed before US-006
   - US-009 depends on having transaction data (US-002 or US-008)
3. **Testing**: Each user story should have corresponding test cases in test plan
4. **Acceptance**: Product owner (Shiman) must approve each completed story

---

**Document Status**: Draft v1.0  
**Approval Required**: Team review  
**Next Steps**: Create corresponding issues in GitLab for each user story