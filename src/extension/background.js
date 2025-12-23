console.log("[Background] Service worker started");

// API URLs - try production first, fallback to localhost
const PRODUCTION_API = "https://watspend-api.onrender.com";
const LOCAL_API = "http://localhost:4000";

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

// Dashboard URLs to check for auth tokens (both local and production)
const DASHBOARD_URLS = [
  "http://localhost:5173/*",
  "http://localhost:5174/*",
  "http://localhost:5175/*",
  "http://localhost:5176/*",
  "https://watspend.vercel.app/*"
];

// Get auth token - try storage first, then dashboard tabs
async function getAuthToken() {
  // Try chrome.storage first
  try {
    const result = await chrome.storage.local.get(['authToken']);
    if (result.authToken) {
      return result.authToken;
    }
  } catch (e) {
    console.log("[Background] Storage error:", e);
  }
  
  // Try production dashboard tab first
  try {
    const prodTabs = await chrome.tabs.query({ url: "https://watspend.vercel.app/*" });
    if (prodTabs.length > 0) {
      const response = await chrome.tabs.sendMessage(prodTabs[0].id, { action: "getAuthToken" });
      if (response && response.token) {
        await chrome.storage.local.set({ authToken: response.token });
        return response.token;
      }
    }
  } catch (e) {
    // Continue to localhost
  }
  
  // Try localhost dashboard tabs
  const ports = [5173, 5174, 5175, 5176];
  for (const port of ports) {
    try {
      const tabs = await chrome.tabs.query({ url: `http://localhost:${port}/*` });
      if (tabs.length > 0) {
        const response = await chrome.tabs.sendMessage(tabs[0].id, { action: "getAuthToken" });
        if (response && response.token) {
          await chrome.storage.local.set({ authToken: response.token });
          return response.token;
        }
      }
    } catch (e) {
      // Continue to next port
    }
  }
  
  return null;
}

// Upload transactions to server
async function uploadTransactions(data) {
  const token = await getAuthToken();
  if (!token) {
    console.error("[Background] No token for upload");
    return { success: false, error: "No token" };
  }
  
  const apiUrl = await getApiUrl();
  console.log("[Background] Using API:", apiUrl);
  
  try {
    const res = await fetch(`${apiUrl}/api/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    console.log("[Background] Upload result:", result);
    return { success: true, data: result };
  } catch (err) {
    console.error("[Background] Upload error:", err);
    return { success: false, error: err.message };
  }
}

// Upload funds to server
async function uploadFunds(data) {
  const token = await getAuthToken();
  if (!token) {
    console.error("[Background] No token for funds upload");
    return { success: false, error: "No token" };
  }
  
  const apiUrl = await getApiUrl();
  console.log("[Background] Using API:", apiUrl);
  
  try {
    const res = await fetch(`${apiUrl}/api/upload-funds`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    console.log("[Background] Funds result:", result);
    return { success: true, data: result };
  } catch (err) {
    console.error("[Background] Funds error:", err);
    return { success: false, error: err.message };
  }
}

// Listen for messages
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("[Background] Received message:", msg.action);
  
  if (msg.action === "setAuthToken") {
    chrome.storage.local.set({ authToken: msg.token }).then(() => {
      console.log("[Background] Token saved to storage");
      sendResponse({ success: true });
    });
    return true;
  }

  if (msg.action === "uploadSnapshot") {
    const txCount = msg.data?.transactions?.length || 0;
    console.log("[Background] Upload request:", txCount, "transactions");
    
    // Use async/await pattern that keeps service worker alive
    uploadTransactions(msg.data).then(result => {
      console.log("[Background] Upload complete:", result);
      sendResponse(result);
    }).catch(err => {
      console.error("[Background] Upload failed:", err);
      sendResponse({ success: false, error: err.message });
    });
    
    return true; // Keep channel open
  }

  if (msg.action === "uploadFunds") {
    console.log("[Background] Funds upload request");
    
    uploadFunds(msg.data).then(result => {
      console.log("[Background] Funds upload complete:", result);
      sendResponse(result);
    }).catch(err => {
      console.error("[Background] Funds upload failed:", err);
      sendResponse({ success: false, error: err.message });
    });
    
    return true; // Keep channel open
  }
  
  // Log unhandled messages
  console.log("[Background] Unhandled message action:", msg.action);
});
