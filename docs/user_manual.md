# WatSpend User Manual

**Live App**: [https://watspend.vercel.app](https://watspend.vercel.app)

---

## Getting Started

### Sign In

1. Go to [https://watspend.vercel.app](https://watspend.vercel.app)
2. Click **"Sign in with Google"**
3. Select your @uwaterloo.ca Google account
4. You're now on your dashboard!

### Install the Chrome Extension

To import transactions from your WatCard account:

1. Download/clone the repository from GitLab
2. Open Chrome → `chrome://extensions/`
3. Enable **Developer mode** (top right toggle)
4. Click **Load unpacked** → Select the `src/extension` folder
5. The WatSpend icon appears in your toolbar

### Import Your Transactions

1. Go to the [WatCard portal](https://watcard.uwaterloo.ca) and log in
2. Navigate to your transaction history
3. Click the WatSpend extension icon in Chrome
4. Click **"Scrape Transactions"**
5. Return to your WatSpend dashboard to see your data

---

## Dashboard

### Balance Cards

Six cards at the top show your current balances:

| Card | What it Shows |
|------|---------------|
| Meal Plan Left | Remaining Meal Plan balance |
| Meal Plan Spent | Total spent from Meal Plan |
| Flex Left | Remaining Flex balance |
| Flex Spent | Total spent from Flex |
| Total Left | Combined remaining balance |
| Total Spent | Combined total spending |

### Views

Switch between two views:
- **By Location**: Spending grouped by vendor location
- **Meal Plan vs Flex**: Spending separated by account type

### Time Range

Filter your data by:
- **Day** - Last 24 hours
- **Week** - Last 7 days
- **Month** - Last 30 days
- **Year** - Last 365 days
- **All Time** - Everything

---

## Transactions

### View Transactions
****
Click **"Transactions"** in the navigation to see all your transactions.

### Search & Filter

- Type in the search box to find transactions by note or terminal
- Filter by label or transaction type

### Add a Manual Transaction

1. Click **"+ Add Transaction"**
2. Enter date, amount, vendor, and label
3. Click **"Save"**

### Edit a Transaction

1. Find the transaction
2. Click the **Edit** (pencil) icon
3. Make changes and click **Save**

---

## Budgets

### Budget Types

**Static Budget**: Fixed amount per period (e.g., $200/month)

**Dynamic Budget**: Auto-calculates daily limit based on remaining balance and end date

### Create a Budget

1. Click **"Create Budget"** or go to Goals page
2. Choose Static or Dynamic
3. Enter details:
   - **Static**: Budget name, amount, period (day/week/month/year)
   - **Dynamic**: Budget name, end date, starting balance
4. Select budget type (Meal Plan or Flex)
5. Click **"Save Budget"**

### Allocate Budget to Labels

1. Open your budget on the Goals page
2. Find **Label Performance** section
3. Click **Edit** next to a label
4. Enter allocation amount
5. Save

---

## Goals & Reports

### Goals Page

Shows:
- All your budgets and their progress
- Label performance breakdown
- Period comparisons (last 5 periods)
- Trophy cabinet (achievements)

### Monthly Report

- Total spending for the period
- Category breakdown
- Comparison to previous period
- Visual charts

---

## Settings

Click the **gear icon** to access settings:

| Setting | Description |
|---------|-------------|
| Theme | Toggle Light/Dark mode |
| Currency | Choose from 9 currencies (CAD, USD, EUR, etc.) |
| Manual Balance | Override synced balance |
| Reset Data | Clear all transactions |

### Supported Currencies

CAD, USD, EUR, GBP, JPY, CNY, INR, AUD, KRW

---

## Exporting Data

1. Click **"Export"** button on Dashboard or Transactions page
2. Select filters:
   - View (By Location or Meal Plan vs Flex)
   - Time Range
3. Preview transaction count
4. Click **"Download CSV"**

The CSV includes: Date, Time, Amount, Vendor, Label, Type, Notes

---

## Troubleshooting

### Can't log in?
- Use a @uwaterloo.ca Google account
- Check your internet connection
- Clear browser cookies and try again

### Extension not working?
- Make sure you're on the WatCard transactions page
- Check that the extension is enabled in Chrome
- Refresh the page and try again

### Transactions not syncing?
- Verify you're logged into WatSpend
- Try clicking "Sync Balance" in the extension
- Check extension permissions

### Budget calculations seem wrong?
- Check the time range selector
- Verify budget period matches your expectation
- Dynamic budgets recalculate daily

---

## Quick Reference

| Action | How To |
|--------|--------|
| Login | Click "Sign in with Google" |
| Import transactions | Use Chrome extension on WatCard site |
| Add manual transaction | Dashboard → "+ Add Transaction" |
| Create budget | Goals → "Create Budget" |
| Export data | Dashboard → "Export" → Download CSV |
| Change theme | Settings → Theme toggle |
| View reports | Goals → Monthly Report section |

---

*Happy budgeting! 💰*
