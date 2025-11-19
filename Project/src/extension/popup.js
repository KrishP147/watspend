const CATEGORY_RULES = [
  {
    name: "Laundry",
    patterns: [/laundry/i, /LN-HS/i, /WON LAUNDRY/i],
  },
  {
    name: "W Store",
    patterns: [/W STORE/i],
  },
  {
    name: "Cafe",
    patterns: [
      /TIM HORTONS/i,
      /\bTH-\d+/i,
      /STARBUCKS/i,
      /JUGO JUICE/i,
      /BRUBAKERS/i,
      /CAF[EÉ]/i,
      /COFFEE/i,
    ],
  },
  {
    name: "ResHalls",
    patterns: [
      /UWP/i,
      /V1/i,
      /REV/i,
      /CMH/i,
      /STJ/i,
      /STJ/i,
      /SJU/i,
      /RES/i,
      /DINING HALL/i,
      /VM-?CMH/i,
      /MEAL PLAN/i,
      /POS-FS-DC/i,
    ],
  },
  {
    name: "Restaurants",
    patterns: [
      /SLC/i,
      /FOOD COURT/i,
      /BRUBAKERS/i,
      /JUGO JUICE/i,
      /EV3/i,
      /BROWSERS/i,
      /POS-FS/i,
      /POS-FS-STC/i,
    ],
  },
];

function categorizeTransaction(transaction) {
  const haystack = `${transaction.terminal} ${transaction.type}`.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(haystack))) {
      return rule.name;
    }
  }
  return "Other";
}

function parseAmount(amountStr) {
  if (!amountStr) return 0;
  const normalized = amountStr.replace(/[$,\s]/g, "");
  const value = Number(normalized);
  return Number.isNaN(value) ? 0 : value;
}

function summarizeCategories(transactions) {
  return transactions.reduce((acc, tx) => {
    const amount = parseAmount(tx.amount);
    if (amount >= 0) {
      return acc; // skip deposits/refunds for spending summary
    }
    const category = categorizeTransaction(tx);
    if (!acc[category]) {
      acc[category] = { count: 0, spent: 0 };
    }
    acc[category].count += 1;
    acc[category].spent += Math.abs(amount);
    return acc;
  }, {});
}

function renderData(latest, history) {
  const display = document.getElementById("dataDisplay");

  if (!latest) {
    display.textContent = "No data scraped yet.";
    return;
  }

  const categorySummary = summarizeCategories(latest.transactions);
  const summaryLines = Object.entries(categorySummary)
    .sort(([, a], [, b]) => b.spent - a.spent)
    .map(
      ([category, stats]) =>
        `- ${category}: ${stats.count} tx | $${stats.spent.toFixed(2)}`
    );

  const transactionsWithCategory = latest.transactions.slice(0, 10).map((tx) => ({
    ...tx,
    category: categorizeTransaction(tx),
  }));

  const info = [
    `Last updated: ${latest.timestamp}`,
    `Transactions this scrape: ${latest.transactionCount}`,
    `Total snapshots saved: ${history?.length || 1}`,
    "",
    "Category breakdown (latest snapshot):",
    summaryLines.length ? summaryLines.join("\n") : "- No spending captured yet",
    "",
    "Recent transactions (first 10):",
    JSON.stringify(transactionsWithCategory, null, 2),
    "",
    "(Showing first 10 transactions...)",
  ].join("\n");
  
  display.textContent = info;
}

function loadData() {
  chrome.storage.local.get(["mealPlanData", "mealPlanHistory"], (res) => {
    renderData(res.mealPlanData, res.mealPlanHistory);
  });
}

async function triggerRefresh() {
  const display = document.getElementById("dataDisplay");
  display.textContent = "Refreshing... Please wait.";
  
  try {
    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      display.textContent = "Error: No active tab found.";
      return;
    }

    // Send message to content script to trigger scrape
    chrome.tabs.sendMessage(tab.id, { action: "refreshScrape" }, (response) => {
      if (chrome.runtime.lastError) {
        display.textContent = `Error: ${chrome.runtime.lastError.message}\n\nMake sure you're on the transactions page with the extension enabled.`;
        return;
      }
      
      // Wait a bit longer for TransactionsPass to load and scrape to complete
      setTimeout(() => {
        loadData();
      }, 2000);
    });
  } catch (error) {
    display.textContent = `Error: ${error.message}`;
  }
}

document.getElementById("refresh").addEventListener("click", triggerRefresh);
document.addEventListener("DOMContentLoaded", loadData);
