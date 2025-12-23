// This content script runs on the dashboard to handle auth requests from the extension

console.log('[Dashboard Sync] Content script loaded');

// Listen for messages from popup/background requesting auth data
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "getAuthToken") {
    const token = localStorage.getItem('authToken');
    console.log('[Dashboard Sync] Token requested:', !!token);
    sendResponse({ token });
    return true;
  }

  if (msg.action === "getUserInfo") {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    console.log('[Dashboard Sync] User info requested:', user?.email);
    sendResponse({ user });
    return true;
  }
});

console.log('[Dashboard Sync] Ready to handle auth requests');
