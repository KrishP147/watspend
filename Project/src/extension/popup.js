// Tab switching
function switchTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.add('hidden');
  });

  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  document.getElementById(`${tabName}-tab`).classList.remove('hidden');
}

// API URLs
const PRODUCTION_API = "https://watspend-api.onrender.com";
const LOCAL_API = "http://localhost:4000";
const PRODUCTION_DASHBOARD = "https://watspend.vercel.app";

// Detect which API to use based on which dashboard is open
async function getApiUrl() {
  // Check if production dashboard is open
  try {
    const prodTabs = await chrome.tabs.query({ url: "https://watspend.vercel.app/*" });
    if (prodTabs.length > 0) {
      return PRODUCTION_API;
    }
  } catch (e) {}
  
  // Check if localhost dashboard is open
  const ports = [5173, 5174, 5175, 5176];
  for (const port of ports) {
    try {
      const tabs = await chrome.tabs.query({ url: `http://localhost:${port}/*` });
      if (tabs.length > 0) {
        return LOCAL_API;
      }
    } catch (e) {}
  }
  
  // Default to production
  return PRODUCTION_API;
}

// Get auth token directly from dashboard's localStorage via content script
async function getAuthToken() {
  try {
    // Try production dashboard first
    try {
      const prodTabs = await chrome.tabs.query({ url: "https://watspend.vercel.app/*" });
      if (prodTabs.length > 0) {
        const response = await chrome.tabs.sendMessage(prodTabs[0].id, { action: 'getAuthToken' });
        if (response && response.token) {
          return response.token;
        }
      }
    } catch (e) {
      // Continue to localhost
    }

    // Try different possible dashboard ports
    const ports = [5173, 5174, 5175, 5176];

    for (const port of ports) {
      try {
        const tabs = await chrome.tabs.query({ url: `http://localhost:${port}/*` });
        if (tabs.length > 0) {
          const response = await chrome.tabs.sendMessage(tabs[0].id, { action: 'getAuthToken' });
          if (response && response.token) {
            return response.token;
          }
        }
      } catch (e) {
        // Port/tab not available, try next one
        continue;
      }
    }

    return null;
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
}

// Get user info directly from dashboard's localStorage via content script
async function getUserInfo() {
  try {
    // Try production dashboard first
    try {
      const prodTabs = await chrome.tabs.query({ url: "https://watspend.vercel.app/*" });
      if (prodTabs.length > 0) {
        const response = await chrome.tabs.sendMessage(prodTabs[0].id, { action: 'getUserInfo' });
        if (response && response.user) {
          return response.user;
        }
      }
    } catch (e) {
      // Continue to localhost
    }

    // Try different possible dashboard ports
    const ports = [5173, 5174, 5175, 5176];

    for (const port of ports) {
      try {
        const tabs = await chrome.tabs.query({ url: `http://localhost:${port}/*` });
        if (tabs.length > 0) {
          const response = await chrome.tabs.sendMessage(tabs[0].id, { action: 'getUserInfo' });
          if (response && response.user) {
            return response.user;
          }
        }
      } catch (e) {
        // Port/tab not available, try next one
        continue;
      }
    }

    return null;
  } catch (error) {
    console.error('Failed to get user info:', error);
    return null;
  }
}

// Check if user is logged in by trying to fetch data from backend
async function checkDashboardAuth() {
  try {
    const token = await getAuthToken();

    if (!token) {
      console.log('No auth token found');
      return false;
    }

    // Send token to background script so it can use it for uploads
    chrome.runtime.sendMessage({ action: "setAuthToken", token: token });

    // Use the appropriate API URL
    const apiUrl = await getApiUrl();
    
    // Try to fetch user's data - if successful, they're logged in
    const response = await fetch(`${apiUrl}/api/data`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      console.log('Auth verified - user is logged in');
      return true;
    }

    console.log('Token verification failed:', response.status);
    return false;
  } catch (error) {
    console.error('Failed to check auth:', error);
    return false;
  }
}

// Update UI based on authentication status
async function updateAuthStatus() {
  const isLoggedIn = await checkDashboardAuth();
  const userInfo = await getUserInfo();

  const authMessage = document.getElementById('auth-message');
  const authMessageFunds = document.getElementById('auth-message-funds');
  const transactionBtn = document.getElementById('scrape-transactions');
  const fundsBtn = document.getElementById('scrape-funds');
  const transactionData = document.getElementById('transaction-data');
  const fundsData = document.getElementById('funds-data');
  const transactionStatus = document.getElementById('transaction-status');
  const fundsStatus = document.getElementById('funds-status');

  if (isLoggedIn) {
    const userEmail = userInfo?.email || 'User';
    authMessage.textContent = 'Logged in as ' + userEmail;
    authMessage.className = 'status success';
    authMessageFunds.textContent = 'Logged in as ' + userEmail;
    authMessageFunds.className = 'status success';
    transactionBtn.disabled = false;
    fundsBtn.disabled = false;
  } else {
    // Show link when not logged in - use production URL
    authMessage.innerHTML = 'Not logged in. <a href="https://watspend.vercel.app" target="_blank" style="color: #667eea; text-decoration: underline;">Open dashboard and sign in</a>';
    authMessage.className = 'status error';
    authMessageFunds.innerHTML = 'Not logged in. <a href="https://watspend.vercel.app" target="_blank" style="color: #667eea; text-decoration: underline;">Open dashboard and sign in</a>';
    authMessageFunds.className = 'status error';
    transactionBtn.disabled = true;
    fundsBtn.disabled = true;

    // Hide data when not logged in
    transactionData.textContent = 'Please log in to view data.';
    fundsData.textContent = 'Please log in to view data.';
    transactionStatus.textContent = 'Not logged in';
    transactionStatus.className = 'status';
    fundsStatus.textContent = 'Not logged in';
    fundsStatus.className = 'status';
  }
}

// Initialize tabs
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.tab);
    });
  });

  // Check authentication first
  updateAuthStatus();

  // Load data
  loadTransactionData();
  loadFundsData();

  // Button handlers
  document.getElementById('scrape-transactions').addEventListener('click', scrapeTransactions);
  document.getElementById('scrape-funds').addEventListener('click', scrapeFunds);

  // Refresh auth status every 5 seconds
  setInterval(updateAuthStatus, 5000);
});

// Load and display transaction data from API
async function loadTransactionData() {
  const display = document.getElementById('transaction-data');
  const status = document.getElementById('transaction-status');

  const token = await getAuthToken();

  if (!token) {
    display.textContent = 'Please log in to view data.';
    status.textContent = 'Not logged in';
    status.className = 'status';
    return;
  }

  try {
    const apiUrl = await getApiUrl();
    
    // Fetch transactions from API using token
    const res = await fetch(`${apiUrl}/api/data`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const data = await res.json();

    if (!data.transactions || data.transactions.length === 0) {
      display.textContent = 'No transactions found.';
      status.textContent = 'No data';
      status.className = 'status';
      return;
    }

    const info = [
      `Last updated: ${data.timestamp || new Date().toISOString()}`,
      `Transactions: ${data.transactionCount || data.transactions.length}`,
      '',
      'Recent transactions (first 5):',
      JSON.stringify(data.transactions.slice(0, 5), null, 2)
    ].join('\n');

    display.textContent = info;
    status.textContent = `${data.transactions.length} transactions loaded`;
    status.className = 'status success';
  } catch (error) {
    console.error('Failed to load transactions:', error);
    display.textContent = `Error: ${error.message}`;
    status.textContent = 'Failed to load';
    status.className = 'status error';
  }
}

// Load and display funds data from API
async function loadFundsData() {
  const display = document.getElementById('funds-data');
  const status = document.getElementById('funds-status');

  const token = await getAuthToken();

  if (!token) {
    display.textContent = 'Please log in to view data.';
    status.textContent = 'Not logged in';
    status.className = 'status';
    return;
  }

  try {
    const apiUrl = await getApiUrl();
    
    // Fetch funds from API using token
    const res = await fetch(`${apiUrl}/api/funds`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const funds = await res.json();

    // Check if we have real data (non-zero balances or a timestamp from actual scrape)
    const hasRealData = (funds.mealPlanBalance > 0 || funds.flexDollarsBalance > 0) || funds.timestamp;
    
    const info = [
      `Last updated: ${funds.timestamp || 'Never scraped'}`,
      '',
      `Meal Plan Balance: $${(funds.mealPlanBalance || 0).toFixed(2)}`,
      `Flex Dollars: $${(funds.flexDollarsBalance || 0).toFixed(2)}`
    ].join('\n');

    display.textContent = info;
    if (hasRealData && (funds.mealPlanBalance > 0 || funds.flexDollarsBalance > 0)) {
      status.textContent = 'Balance data loaded';
      status.className = 'status success';
    } else {
      status.textContent = 'No balance data found on this page';
      status.className = 'status error';
    }
  } catch (error) {
    console.error('Failed to load funds:', error);
    display.textContent = `Error: ${error.message}`;
    status.textContent = 'Failed to load';
    status.className = 'status error';
  }
}

// Scrape transactions
async function scrapeTransactions() {
  const btn = document.getElementById('scrape-transactions');
  const status = document.getElementById('transaction-status');

  btn.disabled = true;
  btn.textContent = 'Scraping...';
  status.textContent = 'Scraping transactions...';
  status.className = 'status';

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab) {
      status.textContent = 'Error: No active tab found';
      status.className = 'status error';
      btn.disabled = false;
      btn.textContent = 'Scrape Transactions';
      return;
    }

    chrome.tabs.sendMessage(tab.id, { action: 'refreshScrape' }, (response) => {
      if (chrome.runtime.lastError) {
        status.textContent = `Error: ${chrome.runtime.lastError.message}`;
        status.className = 'status error';
        btn.disabled = false;
        btn.textContent = 'Scrape Transactions';
        return;
      }

      status.textContent = 'Uploading to server...';
      
      // Reload data multiple times to catch when upload completes
      let attempts = 0;
      const maxAttempts = 5;
      const checkInterval = setInterval(async () => {
        attempts++;
        await loadTransactionData();
        
        // Check if we got data or reached max attempts
        const display = document.getElementById('transaction-data');
        if (!display.textContent.includes('No transactions found') || attempts >= maxAttempts) {
          clearInterval(checkInterval);
          btn.disabled = false;
          btn.textContent = 'Scrape Transactions';
        }
      }, 2000);
    });
  } catch (error) {
    status.textContent = `Error: ${error.message}`;
    status.className = 'status error';
    btn.disabled = false;
    btn.textContent = 'Scrape Transactions';
  }
}

// Scrape funds balance
async function scrapeFunds() {
  const btn = document.getElementById('scrape-funds');
  const status = document.getElementById('funds-status');

  btn.disabled = true;
  btn.textContent = 'Scraping...';
  status.textContent = 'Scraping balance data...';
  status.className = 'status';

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab) {
      status.textContent = 'Error: No active tab found';
      status.className = 'status error';
      btn.disabled = false;
      btn.textContent = 'Scrape Balance';
      return;
    }

    chrome.tabs.sendMessage(tab.id, { action: 'scrapeFunds' }, (response) => {
      if (chrome.runtime.lastError) {
        status.textContent = `Error: ${chrome.runtime.lastError.message}`;
        status.className = 'status error';
        btn.disabled = false;
        btn.textContent = 'Scrape Balance';
        return;
      }

      if (response && response.success) {
        setTimeout(() => {
          loadFundsData();
          btn.disabled = false;
          btn.textContent = 'Scrape Balance';
        }, 500);
      } else {
        status.textContent = response?.error || 'Failed to scrape funds';
        status.className = 'status error';
        btn.disabled = false;
        btn.textContent = 'Scrape Balance';
      }
    });
  } catch (error) {
    status.textContent = `Error: ${error.message}`;
    status.className = 'status error';
    btn.disabled = false;
    btn.textContent = 'Scrape Balance';
  }
}
