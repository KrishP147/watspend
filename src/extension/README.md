# Chrome Extension Updates - WatCard Data Scraper

## 🎯 What Changed

### 1. **Two-Tab Interface**
The extension popup now has two separate tabs:

#### Tab 1: Transactions
- **Purpose**: Scrape transaction history from WatCard page
- **URL**: Navigate to your WatCard transaction history
- **Button**: "Scrape Transactions"
- **What it does**: 
  - Clicks through all pagination pages automatically
  - Extracts all transactions with date, time, amount, terminal, type
  - Saves to `chrome.storage.local` as `mealPlanData` and `mealPlanHistory`
  - Uploads to backend at `http://localhost:4000/api/upload`
  - Shows completion notification on page

#### Tab 2: Balance
- **Purpose**: Scrape current balance from TouchNet Deposit page
- **URL**: https://secure.touchnet.net/C22566_oneweb/Deposit
- **Button**: "Scrape Balance"
- **What it does**:
  - Looks for "Residence Plan" or "Meal Plan" balance
  - Looks for "Flex Dollars" balance
  - If only Flex exists, uses that (handles meal plan-only or flex-only accounts)
  - Saves to `chrome.storage.local` as `fundsData`
  - Uploads to backend at `http://localhost:4000/api/upload-funds`

### 2. **Removed Old Category System**
- **Deleted**: All hardcoded category rules (Laundry, Cafe, ResHalls, etc.)
- **Why**: The app now uses a label system where:
  - **Location View**: Auto-generates labels from transaction terminals (POS-FS-REV, POS-FS-SLC, etc.)
  - **Meal Plan vs Flex View**: Auto-categorizes by transaction type (VEND MONEY = Flex, POS-FS = Meal Plan)
- Labels are created dynamically in `App.tsx` based on transaction data

### 3. **Updated UI/UX**
- **Modern Design**: Gradient header, clean tabs, better spacing
- **Status Messages**: Shows success/error/waiting states with colors
- **Instructions**: Clear guidance on which page to navigate to
- **Data Preview**: Shows last 5 transactions or balance info after scraping

## 📂 Updated Files

### Extension Files
1. **`manifest.json`**
   - Updated name to "WatCard Data Scraper"
   - Version bumped to 2.0.0
   - Updated description

2. **`popup.html`**
   - Two-tab layout: Transactions | Balance
   - Separate buttons and status displays for each tab
   - Instructions with link to deposit page

3. **`popup.css`**
   - Complete redesign with modern styling
   - Tab system with active states
   - Status message styling (success/error/waiting)
   - Button styling with hover effects

4. **`popup.js`**
   - Removed all category logic
   - Tab switching functionality
   - `scrapeTransactions()` - triggers transaction scraping
   - `scrapeFunds()` - triggers balance scraping
   - `loadTransactionData()` - displays transaction preview
   - `loadFundsData()` - displays balance preview

5. **`content.js`**
   - Added `scrapeFundsData()` function
   - Parses "Residence Plan" and "Flex Dollars" from page text
   - Handles meal-plan-only or flex-only scenarios
   - Added `saveFundsData()` function
   - Listens for `scrapeFunds` message from popup

6. **`background.js`**
   - Added `uploadFunds` action handler
   - Uploads funds data to `/api/upload-funds` endpoint

### Backend Files
7. **`mealplan-server/server.js`**
   - Added `/api/upload-funds` endpoint (POST)
   - Saves scraped balance data to `data/fundsData.json`
   - Existing `/api/funds` endpoint (GET) serves data to frontend
   - Logs balance uploads with meal plan and flex amounts

## 🔄 Data Flow

### Transaction Scraping Flow
```
User clicks "Scrape Transactions" 
  → popup.js sends "refreshScrape" message 
  → content.js triggers pagination scraping
  → scrapeAllPages() collects all transactions
  → saveSnapshot() stores in chrome.storage + uploads to server
  → background.js sends POST to /api/upload
  → server saves to MySQL database
  → Frontend fetches via GET /api/data every 30s
  → Dashboard displays transactions
```

### Balance Scraping Flow
```
User navigates to TouchNet Deposit page
User clicks "Scrape Balance"
  → popup.js sends "scrapeFunds" message
  → content.js runs scrapeFundsData()
  → Parses page text for balance amounts
  → saveFundsData() stores in chrome.storage + uploads to server
  → background.js sends POST to /api/upload-funds
  → server saves to data/fundsData.json
  → Frontend fetches via GET /api/funds every 30s
  → Dashboard displays balance in cards
```

## 🚀 How to Use

### Setup
1. **Load Extension in Chrome**:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select `Project/src/extension/` folder

2. **Start Backend Server**:
   ```bash
   cd mealplan-server
   npm install
   node server.js
   ```

3. **Start Frontend**:
   ```bash
   cd src
   npm install
   npm run dev
   ```

### Scraping Transactions
1. Navigate to your WatCard transaction history page
2. Click the extension icon in Chrome toolbar
3. Make sure you're on the "Transactions" tab
4. Click "Scrape Transactions" button
5. Wait for the notification "Scraping Complete!"
6. Check the extension popup for transaction count
7. Go to dashboard to see transactions

### Scraping Balance
1. Navigate to https://secure.touchnet.net/C22566_oneweb/Deposit
2. Click the extension icon
3. Switch to "Balance" tab
4. Click "Scrape Balance" button
5. Check the popup for balance amounts
6. Dashboard will show updated balances in 30s (or refresh)

## 🐛 Troubleshooting

### Issue: Extension shows "Error: No active tab found"
- **Solution**: Make sure you're on a TouchNet page when clicking scrape

### Issue: No balance data found
- **Solution**: 
  1. Make sure you're on the Deposit page (not transaction history)
  2. Check if balances are visible on the page
  3. The scraper looks for text like "Residence Plan: $XXX" or "Flex: $XXX"

### Issue: Transactions not showing in dashboard
- **Solution**:
  1. Check backend server is running on port 4000
  2. Check browser console for fetch errors
  3. Verify data was uploaded (check server logs)
  4. Wait 30 seconds or refresh dashboard

### Issue: "Could not trigger request automatically"
- **Solution**: This is normal - the extension will scrape when the page loads next TransactionsPass data

## 📊 Storage Structure

### chrome.storage.local
```javascript
{
  // Transaction data
  "mealPlanData": {
    "timestamp": "2025-11-29T12:00:00.000Z",
    "transactionCount": 150,
    "transactions": [
      {
        "dateTime": "2025-11-29 14:30",
        "type": "FINANCIAL VEND",
        "terminal": "POS-FS-REV",
        "status": "Approved",
        "balance": "1",
        "units": "0",
        "amount": "$-12.50"
      },
      // ... more transactions
    ]
  },
  
  // Transaction history (all scrapes)
  "mealPlanHistory": [
    { /* same structure as mealPlanData */ },
    // ... older snapshots
  ],
  
  // Balance data
  "fundsData": {
    "mealPlanBalance": 250.00,
    "flexDollarsBalance": 75.50,
    "timestamp": "2025-11-29T12:00:00.000Z"
  }
}
```

## ✅ Testing Checklist

- [ ] Extension loads without errors
- [ ] Two tabs are visible and switchable
- [ ] Transaction tab scrapes data correctly
- [ ] Balance tab scrapes both meal plan and flex amounts
- [ ] Balance tab handles flex-only accounts
- [ ] Data appears in extension popup after scraping
- [ ] Backend receives and saves transaction uploads
- [ ] Backend receives and saves balance uploads
- [ ] Dashboard shows scraped transactions
- [ ] Dashboard cards show correct balance amounts
- [ ] Labels are auto-generated from transactions (Location view)
- [ ] Transactions are categorized as Meal Plan/Flex (MP vs Flex view)

## 🎉 Key Improvements

1. **No more hardcoded categories** - Labels are dynamic and based on actual data
2. **Two-tab interface** - Clear separation of transaction vs balance scraping
3. **Better error handling** - Status messages show what's happening
4. **Modern UI** - Gradient header, clean design, better UX
5. **Flexible balance scraping** - Handles meal plan, flex, or both
6. **Aligned with app** - Extension data structure matches what dashboard expects

---

**Version**: 2.0.0  
**Last Updated**: November 29, 2025
