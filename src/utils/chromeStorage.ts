/**
 * Utility to sync authentication status with Chrome Extension
 * This allows the browser extension to detect when user is logged in
 */

export interface DashboardAuthData {
  isLoggedIn: boolean;
  timestamp: number;
  token?: string;
  user?: {
    id: number;
    email: string;
  };
}

/**
 * Update Chrome extension storage with current auth status
 */
export function syncAuthWithExtension(authData: DashboardAuthData): void {
  try {
    // Check if chrome.storage API is available (extension context)
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set(
        {
          dashboardAuth: {
            ...authData,
            timestamp: Date.now(),
          },
        },
        () => {
          if (chrome.runtime.lastError) {
            console.warn('Failed to sync auth with extension:', chrome.runtime.lastError);
          } else {
            console.log('Auth synced with extension:', authData.isLoggedIn);
          }
        }
      );
    }
  } catch (error) {
    // Silently fail if not in extension context
    console.debug('Chrome storage not available (not in extension context)');
  }
}

/**
 * Notify extension that user logged in
 */
export function notifyExtensionLoggedIn(user: { id: number; email: string }, token?: string): void {
  syncAuthWithExtension({
    isLoggedIn: true,
    timestamp: Date.now(),
    token: token || localStorage.getItem('authToken') || undefined,
    user,
  });
}

/**
 * Notify extension that user logged out
 */
export function notifyExtensionLoggedOut(): void {
  syncAuthWithExtension({
    isLoggedIn: false,
    timestamp: Date.now(),
  });
}

/**
 * Keep auth status fresh by updating timestamp periodically
 */
export function startAuthSync(user: { id: number; email: string }): () => void {
  // Update immediately
  notifyExtensionLoggedIn(user);

  // Update every 10 seconds to keep timestamp fresh
  const interval = setInterval(() => {
    notifyExtensionLoggedIn(user);
  }, 10000);

  // Return cleanup function
  return () => clearInterval(interval);
}
