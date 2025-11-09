User Stories - WatCard Dashboard
Last Updated: Nov 5, 2025

High Priority
US-001: User Authentication with Google
As a UWaterloo student
I want to log in using my Google account
So that my data is secure and personalized
Acceptance Criteria:

"Sign in with Google" button redirects to OAuth
Only @uwaterloo.ca emails allowed
User session persists across browser sessions
User can log out


US-002: Scrape WatCard Transactions
As a WatCard user
I want to automatically import transactions via Chrome extension
So that I don't manually enter each transaction
Acceptance Criteria:

Extension scrapes data when clicked
Data exported as JSON and sent to backend
All transactions captured (date, amount, vendor, location)
Success/error notification shown
Duplicate transactions prevented


US-003: View Spending Dashboard
As a student
I want to see visual dashboard of my spending
So that I understand where my money goes
Acceptance Criteria:

Current balance displayed
Pie chart shows spending by category
Line chart shows trends over 3 months
Total spending for current month shown
Charts are interactive (hover shows values)


US-004: View Transaction History
As a student
I want to see list of all transactions
So that I can review individual purchases
Acceptance Criteria:

List shows: date, vendor, category, amount
Sorted by date (newest first)
Filter by category and date range
Search by vendor name
Shows if scraped or manual


US-005: Set Monthly Spending Goals
As a student
I want to set spending goals per category
So that I stay within budget
Acceptance Criteria:

Set dollar amount for each category
Goals can be edited anytime
Goals reset monthly
Positive numbers only


US-006: View Goal Progress
As a student
I want to see progress bars for my goals
So that I know if I'm on track
Acceptance Criteria:

Progress bar per category with goal
Shows: "$150 / $200 (75%)"
Color coding: green (<70%), yellow (70-99%), red (100%+)
Updates in real-time


US-007: Categorize Transactions Automatically
As a user
I want transactions auto-categorized
So that I don't manually assign categories
Acceptance Criteria:

Tim Hortons → Café
Residence meals → ResHalls
Laundry machines → Laundry
Bookstore → W Store
Food courts → Restaurants
User can manually change category


Medium Priority
US-008: Add Manual Transaction
As a student
I want to manually add transactions
So that I have complete spending record
Acceptance Criteria:

Form with: date, amount, vendor, category, description
All fields validated
Marked as manual (not scraped)
Appears immediately in dashboard


US-009: Generate Monthly Report
As a student
I want to generate monthly spending report
So that I can track progress over time
Acceptance Criteria:

Shows: total, breakdown, goal achievement
Comparison to previous month
Visual charts included
Can view in-page or download PDF


US-010: View Spending Insights
As a student
I want to see personalized insights
So that I make better financial decisions
Acceptance Criteria:

Shows insights like "You spent 30% less on coffee"
At least 3-5 different insight types
Updates automatically


US-011: Edit/Delete Transactions
As a user
I want to edit or delete transactions
So that I can correct mistakes
Acceptance Criteria:

Edit button opens form with current values
Delete requires confirmation
Dashboard updates immediately


US-012: Link to WatCard Website
As a user
I want link to WatCard site
So that I can access full account details
Acceptance Criteria:

Clearly labeled button/link
Opens in new tab


Low Priority (Optional)
US-013: SMS Notifications
As a student
I want SMS notifications about spending
So that I stay informed without checking dashboard
Acceptance Criteria:

Opt-in via settings
SMS at end of month with summary
SMS when goal exceeded
Can opt-out anytime


US-014: Export Data
As a student
I want to export transaction data
So that I can analyze in other tools
Acceptance Criteria:

Export to CSV
Choose date range
Opens in Excel/Sheets


US-015: Custom Categories
As a student
I want to create custom categories
So that I track unique expenses
Acceptance Criteria:

Create category with custom name
Assign transactions to custom categories
Appears in charts/reports


Summary
PriorityCountHigh7Medium5Low3Total15