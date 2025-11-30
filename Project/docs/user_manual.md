# User Manual - WatSpend (WatCard Dashboard)

**Version**: 1.0  
**Last Updated**: November 2025

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Getting Started](#2-getting-started)
3. [Dashboard Overview](#3-dashboard-overview)
4. [Managing Transactions](#4-managing-transactions)
5. [Setting Up Budgets](#5-setting-up-budgets)
6. [Using the Chrome Extension](#6-using-the-chrome-extension)
7. [Goals & Reports](#7-goals--reports)
8. [Settings](#8-settings)
9. [Exporting Data](#9-exporting-data)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Introduction

### 1.1 What is WatSpend?

WatSpend is a comprehensive budget tracking application designed specifically for University of Waterloo students who use WatCard. It helps you:

- **Track spending** across Meal Plan and Flex accounts
- **Set budgets** to manage your WatCard balance effectively
- **Visualize trends** with charts and reports
- **Auto-import transactions** using our Chrome extension
- **Categorize expenses** by location or account type

### 1.2 Key Features

| Feature | Description |
|---------|-------------|
| 🔐 Secure Login | Google OAuth or email/password authentication |
| 📊 Dashboard | Visual overview of spending with charts |
| 💰 Budget Tracking | Static and dynamic budget options |
| 🏷️ Label System | Organize transactions by location or type |
| 📱 Chrome Extension | Auto-scrape transactions from WatCard portal |
| 📈 Reports | Monthly spending analysis and comparisons |
| 🌙 Dark Mode | Easy on the eyes for late-night studying |

---

## 2. Getting Started

### 2.1 System Requirements

- **Browser**: Google Chrome 90+ (recommended for extension)
- **Internet**: Stable connection required
- **Account**: UWaterloo Google account (@uwaterloo.ca)

### 2.2 Accessing the Application

1. Open your web browser
2. Navigate to the WatSpend dashboard URL
3. You'll see the login page

### 2.3 Creating an Account

**Option A: Google Sign-In (Recommended)**
1. Click the **"Sign in with Google"** button
2. Select your @uwaterloo.ca Google account
3. Grant permissions when prompted
4. You'll be redirected to your dashboard

**Option B: Email/Password**
1. Click **"Sign up"**
2. Enter your email address
3. Create a secure password
4. Click **"Create Account"**
5. You'll be logged in automatically

### 2.4 First-Time Setup

After logging in for the first time:
1. Two default views are created: **"By Location"** and **"Meal Plan vs Flex"**
2. Install the Chrome extension (see Section 6)
3. Import your first transactions
4. Set up your first budget

---

## 3. Dashboard Overview

### 3.1 Balance Cards

At the top of your dashboard, you'll see 6 balance cards:

| Card | Description |
|------|-------------|
| Meal Plan Left | Remaining Meal Plan balance |
| Meal Plan Spent | Total spent from Meal Plan |
| Flex Left | Remaining Flex balance |
| Flex Spent | Total spent from Flex |
| Total Left | Combined remaining balance |
| Total Spent | Combined total spending |

### 3.2 View Selector

Switch between different ways to view your spending:

- **By Location**: See spending grouped by vendor/terminal location
- **Meal Plan vs Flex**: See spending separated by account type

### 3.3 Time Range Selector

Filter your data by time period:

| Range | Shows |
|-------|-------|
| Day | Last 24 hours |
| Week | Last 8 days |
| Month | Last 31 days |
| Year | Last 366 days |
| All Time | All transactions |

### 3.4 Spending Breakdown

A visual chart showing:
- Spending per label/category
- Transaction counts per category
- Percentage breakdown

---

## 4. Managing Transactions

### 4.1 Viewing Transactions

1. Click **"Transactions"** in the navigation
2. Browse your transaction list
3. Use pagination buttons at the bottom (50 items per page)

### 4.2 Search and Filter

**Search**: Type in the search box to find transactions by note or terminal

**Filter Options**:
- **By Label**: Select a specific category
- **By Type**: Filter by Meal Plan or Flex

### 4.3 Adding Manual Transactions

1. Click **"+ Add Transaction"** button
2. Fill in the required fields:
   - **Date**: Select the transaction date
   - **Amount**: Enter the dollar amount
   - **Vendor**: Enter the merchant name
   - **Label**: Assign a category
3. Click **"Save"**

> ⚠️ **Note**: Manual transactions won't appear on your official WatCard dashboard - they're for personal tracking only.

### 4.4 Editing Transactions

1. Find the transaction in the list
2. Click the **Edit** (pencil) icon
3. Modify the fields as needed
4. Click **"Save Changes"**

### 4.5 Transaction Columns

| Column | Description |
|--------|-------------|
| # | Transaction number |
| Date | Transaction date |
| Time | Transaction time |
| Amount | Dollar amount |
| Label | Assigned category |
| Terminal | Point-of-sale terminal ID |
| Type | Meal Plan or Flex |
| Note | Optional description |
| Actions | Edit/Delete buttons |

---

## 5. Setting Up Budgets

### 5.1 Understanding Budget Types

**Static Budget**
- Fixed amount per time period
- Example: "$200/month for food"

**Dynamic Budget**
- Based on remaining balance and end date
- Auto-calculates daily spending limit
- Example: "Make $500 last until December 20"

### 5.2 Creating a Budget

1. Click **"Create Budget"** or go to Goals page
2. Choose budget type (Static or Dynamic)
3. Enter budget details:

**For Static:**
- Budget name
- Amount
- Period (Day, Week, Month, Year)
- Budget type (Meal Plan or Flex)

**For Dynamic:**
- Budget name
- End date
- Starting balance (or use current)
- Budget type (Meal Plan or Flex)

4. Click **"Save Budget"**

### 5.3 Budget Allocations

Allocate your budget to specific labels:

1. Open the budget on the Goals page
2. Find the **Label Performance** section
3. Click the **Edit** button next to a label
4. Enter the amount to allocate
5. Click **Save**

> 💡 **Tip**: Labels are greyed out if they don't match your budget type (e.g., Meal Plan labels are greyed out for a Flex-only budget).

### 5.4 Viewing Budget Progress

The dashboard widget shows:
- Current spending vs. budget
- Progress bar (green/yellow/red)
- Daily allowance remaining
- Days until budget end (dynamic only)

---

## 6. Using the Chrome Extension

### 6.1 Installing the Extension

1. Download the extension files from the project
2. Open Chrome and go to `chrome://extensions/`
3. Enable **"Developer mode"** (top right)
4. Click **"Load unpacked"**
5. Select the `src/extension` folder
6. The WatSpend icon appears in your toolbar

### 6.2 Scraping Transactions

1. Log into your WatCard account at the official WatCard portal
2. Navigate to your transaction history page
3. Click the WatSpend extension icon
4. Click **"Scrape Transactions"**
5. Wait for the import to complete
6. Check your dashboard for new transactions

### 6.3 Syncing Balance

The extension automatically syncs:
- Current Meal Plan balance
- Current Flex balance
- Recent transactions

### 6.4 Extension Popup Features

| Button | Function |
|--------|----------|
| Scrape Transactions | Import transaction history |
| Sync Balance | Update account balances |
| Open Dashboard | Open WatSpend in new tab |

---

## 7. Goals & Reports

### 7.1 Goals Page

Access via the navigation menu to see:
- All your budgets
- Budget performance charts
- Label performance breakdown
- Period comparison (last 5 periods)
- Trophy cabinet (achievements)

### 7.2 Label Performance

For each label, you can see:
- Amount spent
- Amount allocated (if budget set)
- Progress bar showing spent vs. allocated
- Warning if over budget (red bar)

### 7.3 Monthly Report

The monthly report includes:
- Total spending for the period
- Breakdown by category
- Comparison to previous period
- Visual charts

### 7.4 Period Comparison

Compare your spending across:
- Last 5 days
- Last 5 weeks
- Last 5 months
- Last 5 years

---

## 8. Settings

### 8.1 Accessing Settings

Click the **gear icon** or **"Settings"** in the navigation.

### 8.2 Available Options

| Setting | Description |
|---------|-------------|
| Theme | Toggle between Light and Dark mode |
| Currency | Choose from 9 supported currencies |
| Manual Balance | Override synced balance (with warning) |
| Reset Data | Clear all transactions and start fresh |

### 8.3 Currency Options

| Code | Currency |
|------|----------|
| CAD | Canadian Dollar ($) |
| USD | US Dollar ($) |
| EUR | Euro (€) |
| GBP | British Pound (£) |
| JPY | Japanese Yen (¥) |
| CNY | Chinese Yuan (¥) |
| INR | Indian Rupee (₹) |
| AUD | Australian Dollar (A$) |
| KRW | Korean Won (₩) |

### 8.4 Account Management

- **Change Email**: Update your email address
- **Change Password**: Set a new password
- **Delete Account**: Permanently remove your account and data

---

## 9. Exporting Data

### 9.1 Exporting Transactions

1. Click the **"Export"** button on Dashboard or Goals page
2. Select your filters:
   - View (By Location or Meal Plan vs Flex)
   - Time Range (Day, Week, Month, Year, All)
3. Preview the transaction count
4. Click **"Download CSV"**

### 9.2 CSV Format

Exported files include:
- Date
- Time
- Amount
- Vendor
- Category/Label
- Type (Meal Plan/Flex)
- Notes

### 9.3 File Naming

Files are automatically named:
`watspend_[view]_[range]_[date].csv`

Example: `watspend_location_month_2025-11-15.csv`

---

## 10. Troubleshooting

### 10.1 Common Issues

**Can't log in?**
- Ensure you're using a @uwaterloo.ca email for Google login
- Check your internet connection
- Try clearing browser cookies

**Extension not working?**
- Make sure you're on the WatCard transactions page
- Check that the extension is enabled in Chrome
- Try refreshing the page

**Transactions not syncing?**
- Check your login status
- Try manually triggering a sync
- Verify the extension has proper permissions

**Budget calculations seem off?**
- Check the time range selector
- Verify the budget period matches your expectation
- Dynamic budgets recalculate daily

### 10.2 Getting Help

If you encounter issues:
1. Check this manual first
2. Review the FAQ section
3. Contact the development team via GitLab issues

### 10.3 Browser Compatibility

| Browser | Support Level |
|---------|---------------|
| Chrome | ✅ Full support (extension included) |
| Firefox | ⚠️ Dashboard only (no extension) |
| Safari | ⚠️ Dashboard only (no extension) |
| Edge | ⚠️ Dashboard only (extension may work) |

---

## Quick Reference Card

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

**Need more help?** Contact the WatSpend team or submit an issue on GitLab.

*Happy budgeting! 💰*
