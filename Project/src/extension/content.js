console.log("[MealPlanScraper] Content script loaded");

// Promise to track when TransactionsPass data is loaded
let transactionsPassPromiseResolver = null;
let waitingForTransactionsPass = false;

// Show a popup notification when scraping is complete
function showScrapingCompleteNotification(transactionCount, pageCount) {
  // Remove any existing notification
  const existingNotification = document.getElementById("mealplan-scraper-notification");
  if (existingNotification) {
    existingNotification.remove();
  }

  // Create notification element
  const notification = document.createElement("div");
  notification.id = "mealplan-scraper-notification";
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    font-size: 14px;
    max-width: 350px;
    animation: slideIn 0.3s ease-out;
  `;
  
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <div style="font-size: 24px;">✓</div>
      <div>
        <div style="font-weight: 600; margin-bottom: 4px;">Scraping Complete!</div>
        <div style="font-size: 12px; opacity: 0.9;">
          Scraped ${transactionCount} transactions from ${pageCount} page${pageCount !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  `;

  // Add animation keyframes
  if (!document.getElementById("mealplan-scraper-notification-styles")) {
    const style = document.createElement("style");
    style.id = "mealplan-scraper-notification-styles";
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(notification);

  // Auto-remove after 5 seconds with fade out
  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease-out";
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
  }, 5000);
}

// === Scraper function ===
function scrapeMealData() {
  const table = document.querySelector("#financial-transaction-table-holder-card");
  if (!table) {
    console.warn("[MealPlanScraper] Table not found yet.");
    return [];
  }

  const rows = Array.from(table.querySelectorAll("tbody tr"));
  return rows.map(row => {
    const cols = row.querySelectorAll("td");
    return {
      dateTime: cols[0]?.textContent.trim() || "",
      type: cols[1]?.textContent.trim() || "",
      terminal: cols[2]?.textContent.trim() || "",
      status: cols[3]?.textContent.trim() || "",
      balance: cols[4]?.textContent.trim() || "",
      units: cols[5]?.textContent.trim() || "",
      amount: cols[6]?.textContent.trim() || ""
    };
  });
}

// Helper function to extract all visible page numbers from the DOM
function extractPageNumbers() {
  const paginationNumbers = document.querySelectorAll(".paging_simple_numbers li a");
  const pageMap = new Map();
  
  for (const pageLink of paginationNumbers) {
    const text = pageLink.textContent.trim();
    const pageNum = parseInt(text, 10);
    if (!isNaN(pageNum) && pageNum > 0) {
      pageMap.set(pageNum, pageLink);
    }
  }
  
  return pageMap;
}

// Scrape all pages by iterating through pagination
async function scrapeAllPages() {
  console.log("[MealPlanScraper] Starting to scrape all pages...");
  
  const allTransactions = [];
  const scrapedPages = new Set(); // Track which page numbers we've already scraped
  
  // Check if pagination exists
  const initialPages = extractPageNumbers();
  if (initialPages.size === 0) {
    console.log("[MealPlanScraper] No pagination found, scraping current page only.");
    const transactions = scrapeMealData();
    return {
      transactions: transactions,
      pageCount: 1
    };
  }

  // Start with the first page (usually page 1)
  const sortedPageNumbers = Array.from(initialPages.keys()).sort((a, b) => a - b);
  let currentPageNum = sortedPageNumbers[0];
  let hasMorePages = true;
  let consecutiveEmptyPages = 0;
  const maxEmptyPages = 2; // Stop if we hit 2 pages with no new data

  console.log(`[MealPlanScraper] Starting from page ${currentPageNum}`);

  while (hasMorePages) {
    // Check if we've already scraped this page
    if (scrapedPages.has(currentPageNum)) {
      console.log(`[MealPlanScraper] Page ${currentPageNum} already scraped, looking for next page...`);
      
      // Re-extract page numbers to see if new ones appeared
      const currentPages = extractPageNumbers();
      const availablePages = Array.from(currentPages.keys())
        .filter(num => !scrapedPages.has(num))
        .sort((a, b) => a - b);
      
      if (availablePages.length === 0) {
        console.log("[MealPlanScraper] No more unscraped pages found.");
        hasMorePages = false;
        break;
      }
      
      currentPageNum = availablePages[0];
      continue;
    }

    // Find the page link element
    const currentPages = extractPageNumbers();
    const pageLink = currentPages.get(currentPageNum);
    
    if (!pageLink) {
      console.log(`[MealPlanScraper] Page ${currentPageNum} link not found, checking for other pages...`);
      
      // Re-extract to see if new pages appeared
      const updatedPages = extractPageNumbers();
      const availablePages = Array.from(updatedPages.keys())
        .filter(num => !scrapedPages.has(num))
        .sort((a, b) => a - b);
      
      if (availablePages.length === 0) {
        hasMorePages = false;
        break;
      }
      
      currentPageNum = availablePages[0];
      continue;
    }

    console.log(`[MealPlanScraper] Scraping page ${currentPageNum} (${scrapedPages.size + 1} pages scraped so far)...`);
    
    // Click the page number
    pageLink.click();
    
    // Wait for the table to update
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Scrape the current page
    const pageTransactions = scrapeMealData();
    
    // Check if we got any transactions
    if (pageTransactions.length === 0) {
      consecutiveEmptyPages++;
      console.log(`[MealPlanScraper] Page ${currentPageNum} returned no transactions (${consecutiveEmptyPages} consecutive empty pages)`);
      
      if (consecutiveEmptyPages >= maxEmptyPages) {
        console.log("[MealPlanScraper] Too many empty pages, stopping.");
        hasMorePages = false;
        break;
      }
    } else {
      consecutiveEmptyPages = 0; // Reset counter if we got data
      allTransactions.push(...pageTransactions);
    }
    
    // Mark this page as scraped
    scrapedPages.add(currentPageNum);
    
    // Re-extract page numbers to see if new ones appeared after clicking
    const updatedPages = extractPageNumbers();
    const allAvailablePages = Array.from(updatedPages.keys()).sort((a, b) => a - b);
    const unscrapedPages = allAvailablePages.filter(num => !scrapedPages.has(num));
    
    // Check if there are more pages to scrape
    if (unscrapedPages.length === 0) {
      // No more unscraped pages visible
      // Check if we're on the last page by seeing if we got fewer entries than expected
      // (assuming 10 entries per page is the standard)
      if (pageTransactions.length < 10 && pageTransactions.length > 0) {
        console.log(`[MealPlanScraper] Last page has ${pageTransactions.length} entries (less than 10), likely the final page.`);
        hasMorePages = false;
      } else {
        // Try to find the next page number (current + 1)
        const nextPageNum = currentPageNum + 1;
        if (updatedPages.has(nextPageNum)) {
          currentPageNum = nextPageNum;
        } else {
          hasMorePages = false;
        }
      }
    } else {
      // Move to the next unscraped page
      currentPageNum = unscrapedPages[0];
    }
  }

  console.log(`[MealPlanScraper] Scraped ${allTransactions.length} total transactions from ${scrapedPages.size} pages`);
  return {
    transactions: allTransactions,
    pageCount: scrapedPages.size
  };
}

// Save scraped data to storage
function saveSnapshot(transactions, pageCount = null) {
  if (transactions.length === 0) {
    console.warn("[MealPlanScraper] No transactions to save.");
    return;
  }

  const newSnapshot = {
    timestamp: new Date().toISOString(),
    transactionCount: transactions.length,
    transactions
  };

  chrome.storage.local.get(["mealPlanHistory"], (res) => {
    let history = res.mealPlanHistory || [];
    const last = history[history.length - 1];

    // Avoid duplicate saves if data identical
    if (last && JSON.stringify(last.transactions) === JSON.stringify(newSnapshot.transactions)) {
      console.log("[MealPlanScraper] No change in transactions, skipping save.");
      if (transactionsPassPromiseResolver) {
        transactionsPassPromiseResolver();
        transactionsPassPromiseResolver = null;
        waitingForTransactionsPass = false;
      }
      return;
    }

    history.push(newSnapshot);
    chrome.storage.local.set({ mealPlanHistory: history, mealPlanData: newSnapshot }, () => {
      console.log("[MealPlanScraper] Snapshot saved! Total:", history.length);
    });
    
    chrome.runtime.sendMessage({
      action: "uploadSnapshot",
      data: newSnapshot
    });

    // Show notification
    if (pageCount !== null) {
      showScrapingCompleteNotification(transactions.length, pageCount);
    }

    // Resolve promise if we're waiting for TransactionsPass
    if (transactionsPassPromiseResolver) {
      transactionsPassPromiseResolver();
      transactionsPassPromiseResolver = null;
      waitingForTransactionsPass = false;
    }
  });
}

// Trigger TransactionsPass request
function triggerTransactionsPassRequest() {
  console.log("[MealPlanScraper] Attempting to trigger TransactionsPass request...");
  
  const refreshButton = document.querySelector("#tran-search-view-history-button");
  
  if (refreshButton) {
    console.log("[MealPlanScraper] Found refresh button, clicking...");
    refreshButton.click();
    return true;
  }

  return false;
}

// Also handle fetch() calls
(function () {
  const origFetch = window.fetch;
  window.fetch = async (...args) => {
    const url = args[0];
    const isTransactionsPass = typeof url === "string" && url.includes("TransactionsPass");
    
    if (isTransactionsPass) {
      console.log("[MealPlanScraper] Detected fetch to TransactionsPass");
      waitingForTransactionsPass = true;
    }
    
    const response = await origFetch(...args);
    
    if (isTransactionsPass) {
      console.log("[MealPlanScraper] TransactionsPass fetch completed → scraping all pages.");
      await new Promise(resolve => setTimeout(resolve, 1500)); // wait for table to render
      const result = await scrapeAllPages();
      saveSnapshot(result.transactions, result.pageCount);
    }
    
    return response;
  };
})();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "refreshScrape") {
    console.log("[MealPlanScraper] Refresh requested, triggering TransactionsPass request...");
    
    // Create a promise to wait for TransactionsPass to load
    const promise = new Promise(async (resolve) => {
      transactionsPassPromiseResolver = resolve;
      waitingForTransactionsPass = true;
      
      // Timeout after 10 seconds
      setTimeout(async () => {
        if (waitingForTransactionsPass) {
          console.warn("[MealPlanScraper] Timeout waiting for TransactionsPass, scraping anyway");
          waitingForTransactionsPass = false;
          transactionsPassPromiseResolver = null;
          const result = await scrapeAllPages();
          saveSnapshot(result.transactions, result.pageCount);
          resolve();
        }
      }, 10000);
    });

    // Try to trigger the request
    const triggered = triggerTransactionsPassRequest();
    
    if (!triggered) {
      console.log("[MealPlanScraper] Could not trigger request automatically, waiting for next TransactionsPass request...");
      promise.then(() => {
        sendResponse({ success: true });
      });
      return true; // Keep channel open for async response
    }

    // Wait for the request to complete
    promise.then(() => {
      sendResponse({ success: true });
    });
    
    return true; // Keep the message channel open for async response
  }
});

// Fallback: try after 5s just in case
setTimeout(async () => {
  const result = await scrapeAllPages();
  saveSnapshot(result.transactions, result.pageCount);
}, 5000);
