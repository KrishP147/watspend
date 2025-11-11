function renderData(latest, history) {
    const display = document.getElementById("dataDisplay");
  
    if (!latest) {
      display.textContent = "No data scraped yet.";
      return;
    }
  
    const info = [
      `Last updated: ${latest.timestamp}`,
      `Transactions this scrape: ${latest.transactionCount}`,
      `Total snapshots saved: ${history?.length || 1}`,
      "",
      JSON.stringify(latest.transactions.slice(0, 10), null, 2), // only show first 10 for brevity
      "",
      "(Showing first 10 transactions...)"
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
  