console.log("[MealPlanScraper] Content script loaded");

// Promise to track when TransactionsPass data is loaded
let transactionsPassPromiseResolver = null;
let waitingForTransactionsPass = false;

// === Scraper function ===
function scrapeMealData() {
  const table = document.querySelector("#financial-transaction-table-holder-card");
  if (!table) {
    console.warn("[MealPlanScraper] Table not found yet.");
    return;
  }

  const rows = Array.from(table.querySelectorAll("tbody tr"));
  const transactions = rows.map(row => {
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
      // Still resolve the promise if we're waiting
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
  
  // Strategy 1: Try to find and click a refresh/reload button
  const refreshButtons = [
    ...document.querySelectorAll('button[title*="refresh" i]'),
    ...document.querySelectorAll('button[title*="reload" i]'),
    ...document.querySelectorAll('a[title*="refresh" i]'),
    ...document.querySelectorAll('[class*="refresh" i]'),
    ...document.querySelectorAll('[id*="refresh" i]'),
    ...document.querySelectorAll('[aria-label*="refresh" i]'),
    ...document.querySelectorAll('button:has(svg[class*="refresh" i])'),
  ];
  
  if (refreshButtons.length > 0) {
    console.log("[MealPlanScraper] Found refresh button, clicking...");
    refreshButtons[0].click();
    return true;
  }

  // Strategy 2: Try to trigger a form submission or event that might reload the data
  const forms = document.querySelectorAll('form');
  for (const form of forms) {
    const action = form.action || '';
    if (action.includes('TransactionsPass') || action.includes('transaction')) {
      console.log("[MealPlanScraper] Found form, submitting...");
      form.submit();
      return true;
    }
  }

  // Strategy 3: Look for links or buttons that might trigger TransactionsPass
  const allLinks = document.querySelectorAll('a, button');
  for (const link of allLinks) {
    const href = link.href || '';
    const onclick = link.getAttribute('onclick') || '';
    const text = link.textContent || '';
    if (href.includes('TransactionsPass') || onclick.includes('TransactionsPass') || 
        text.toLowerCase().includes('transaction')) {
      console.log("[MealPlanScraper] Found link/button that might trigger TransactionsPass, clicking...");
      link.click();
      return true;
    }
  }

  // Strategy 4: Try to reload the iframe or trigger a page event
  const iframes = document.querySelectorAll('iframe');
  for (const iframe of iframes) {
    try {
      if (iframe.src && iframe.src.includes('TransactionsPass')) {
        console.log("[MealPlanScraper] Reloading iframe with TransactionsPass");
        iframe.src = iframe.src; // Reload iframe
        return true;
      }
    } catch (e) {
      console.warn("[MealPlanScraper] Cannot access iframe:", e);
    }
  }

  // Strategy 5: Try to dispatch a custom event that might trigger a reload
  try {
    const events = ['reload', 'refresh', 'update', 'load'];
    for (const eventName of events) {
      window.dispatchEvent(new Event(eventName));
      document.dispatchEvent(new Event(eventName));
    }
    console.log("[MealPlanScraper] Dispatched reload events");
  } catch (e) {
    console.warn("[MealPlanScraper] Could not dispatch events:", e);
  }

  return false;
}

// Intercept XMLHttpRequests
(function () {
  const origOpen = window.XMLHttpRequest.prototype.open;
  window.XMLHttpRequest.prototype.open = function (...args) {
    const url = args[1];
    if (url && typeof url === "string" && url.includes("TransactionsPass")) {
      console.log("[MealPlanScraper] Detected TransactionsPass XHR request");
      waitingForTransactionsPass = true;
      this.addEventListener("load", () => {
        console.log("[MealPlanScraper] TransactionsPass XHR loaded → scraping table.");
        setTimeout(scrapeMealData, 1000); // wait 1s for DOM update
      });
    }
    return origOpen.apply(this, args);
  };
})();

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
      console.log("[MealPlanScraper] TransactionsPass fetch completed → scraping soon.");
      // wait for table to render
      setTimeout(scrapeMealData, 1500);
    }
    
    return response;
  };
})();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "refreshScrape") {
    console.log("[MealPlanScraper] Refresh requested, triggering TransactionsPass request...");
    
    // Create a promise to wait for TransactionsPass to load
    const promise = new Promise((resolve) => {
      transactionsPassPromiseResolver = resolve;
      waitingForTransactionsPass = true;
      
      // Timeout after 10 seconds
      setTimeout(() => {
        if (waitingForTransactionsPass) {
          console.warn("[MealPlanScraper] Timeout waiting for TransactionsPass, scraping anyway");
          waitingForTransactionsPass = false;
          transactionsPassPromiseResolver = null;
          scrapeMealData(); // Try to scrape anyway
          resolve();
        }
      }, 10000);
    });

    // Try to trigger the request
    const triggered = triggerTransactionsPassRequest();
    
    if (!triggered) {
      console.log("[MealPlanScraper] Could not trigger request automatically, waiting for next TransactionsPass request...");
      // If we can't trigger it, wait for the next one (with timeout)
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
setTimeout(scrapeMealData, 5000);
