console.log("[Background] Service worker started");

// Configuration - Change this URL for production deployment
// Development: http://localhost:4000
// Production: Your Render backend URL (e.g., https://watspend-api.onrender.com)
const API_BASE_URL = "http://localhost:4000";

// Dashboard URLs to check for auth tokens
const DASHBOARD_URLS = [
  "http://localhost:5173/*",
  "http://localhost:5174/*",
  "http://localhost:5175/*",
  "http://localhost:5176/*"
  // Add your Vercel production URL here when deployed:
  // "https://your-app.vercel.app/*"
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
  
  // Try dashboard tabs (both localhost and production)
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
  
  try {
    const res = await fetch(`${API_BASE_URL}/api/upload`, {
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
  
  try {
    const res = await fetch(`${API_BASE_URL}/api/upload-funds`, {
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
