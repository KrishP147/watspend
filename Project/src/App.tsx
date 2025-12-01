import { useState, useEffect, createContext, useContext, useRef } from "react";
import { DashboardOverview } from "./components/dashboard-overview";
import { CategoryManager } from "./components/category-manager";
import { TransactionManager } from "./components/transaction-manager";
import { MonthlyReport } from "./components/monthly-report";
import { Settings } from "./components/settings";
import { LoginPage } from "./components/login-page";
import { AuthCallback } from "./components/auth-callback";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { LayoutDashboard, Wallet, TrendingUp, Settings as SettingsIcon, User } from "lucide-react";
import { SUPPORTED_CURRENCIES } from "./utils/currency";
import { authService } from "./services/authService";
import { startAuthSync, notifyExtensionLoggedOut } from "./utils/chromeStorage";

// API base URL - uses environment variable in production, empty string for local dev (Vite proxy)
const API_BASE = import.meta.env.VITE_API_URL || '';

const PRESET_COLORS = [
  "#8B4513", "#FF6B6B", "#4ECDC4", "#45B7D1", "#95A5A6",
  "#F39C12", "#9B59B6", "#E74C3C", "#1ABC9C", "#3498DB",
];

// ------------------- TYPES -------------------
export interface Label {
  id: string;
  name: string;
  type: 'location' | 'flex' | 'custom'; // location = POS-FS-XXX, flex = flex dollar locations, custom = user-defined
  createdAt?: number;
}

export interface View {
  id: string;
  name: string;
  type: 'location' | 'mealplan-flex' | 'custom'; // location = location-based grouping, mealplan-flex = meal plan vs flex, custom = user-created
  categoryIds: string[]; // Categories that belong to this view
}

// Label allocation for a specific view
export interface LabelAllocation {
  categoryId: string; // Category/label ID
  amount: number; // Allocated amount (in the budget's period)
}

export interface Budget {
  id: string;
  name: string;
  type: 'mealplan' | 'flex'; // Separate budgets for meal plan money vs flex dollars
  amount: number; // Budget amount per period (for static) or daily amount (for dynamic)
  period: 'day' | 'week' | 'month' | 'year'; // Budget period
  endDate?: string; // Optional end date for dynamic budgets
  isDynamic: boolean; // If true, recalculates daily based on remaining balance and days
  createdAt: number;
  labelAllocations?: Record<string, LabelAllocation[]>; // viewId -> allocations for that view
}

export interface Category {
  id: string;
  name: string;
  monthlyGoal: number;
  color: string;
  labelIds: string[]; // Array of label IDs assigned to this category
  viewId: string; // Which view this category belongs to
}

export interface Transaction {
  id: string;
  amount: number;
  date: string;
  categoryId: string; // Legacy - for backwards compatibility, maps to selectedViewId
  categoryIds?: Record<string, string>; // Map of viewId -> categoryId (per-view category assignment)
  type: "expense" | "income";
  note?: string;
}

interface AppSettings {
  currency: string;
  theme: "light" | "dark";
}

interface AppContextType {
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
  initialBalance: number;
  setInitialBalance: (balance: number) => void;
  displayCurrency: string;
  setDisplayCurrency: (currency: string) => void;
  fundsData: { mealPlanBalance: number; flexDollarsBalance: number };
  setFundsData: (funds: { mealPlanBalance: number; flexDollarsBalance: number }) => void;
  labels: Label[];
  setLabels: (labels: Label[]) => void;
  views: View[];
  setViews: (views: View[]) => void;
  selectedViewId: string;
  setSelectedViewId: (viewId: string) => void;
  budgets: Budget[];
  setBudgets: (budgets: Budget[]) => void;
  selectedBudgetId: string | null;
  setSelectedBudgetId: (budgetId: string | null) => void;
}

// ------------------- CONTEXT -------------------
const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
};

// ------------------- DEFAULT VIEWS & CATEGORIES -------------------
const defaultViews: View[] = [
  {
    id: "view-location",
    name: "By Location",
    type: "location",
    categoryIds: ["loc-other"] // Will be populated with location-based categories
  },
  {
    id: "view-mealplan-flex",
    name: "Meal Plan vs Flex",
    type: "mealplan-flex",
    categoryIds: ["mp-mealplan", "mp-flex", "mp-other"]
  }
];

// Categories for View 1: Location-based (parsed from POS-FS-XXX)
// Only "Other" as fallback - all other labels created dynamically from transaction strings
const locationViewCategories: Category[] = [
  { id: "loc-other", name: "Other", monthlyGoal: 0, color: "#95A5A6", labelIds: [], viewId: "view-location" }
];

// Categories for View 2: Meal Plan vs Flex Dollars
// Default categories for meal plan vs flex view
const mealplanFlexCategories: Category[] = [
  { id: "mp-mealplan", name: "Meal Plan", monthlyGoal: 0, color: "#00D9FF", labelIds: [], viewId: "view-mealplan-flex" },
  { id: "mp-flex", name: "Flex Dollars", monthlyGoal: 0, color: "#FF1493", labelIds: [], viewId: "view-mealplan-flex" },
  { id: "mp-other", name: "Other", monthlyGoal: 0, color: "#95A5A6", labelIds: [], viewId: "view-mealplan-flex" }
];

const defaultCategories: Category[] = [
  ...locationViewCategories,
  ...mealplanFlexCategories
];

// ------------------- LABEL GENERATION -------------------
function generateLabelsFromTransactions(transactions: Transaction[]): Label[] {
  const labels: Map<string, Label> = new Map();
  
  transactions.forEach(tx => {
    const note = tx.note || '';
    
    // Extract POS-FS-XXX patterns (location labels)
    const posFsMatch = note.match(/POS-FS-(\w+)/i);
    if (posFsMatch) {
      const location = posFsMatch[1].toUpperCase();
      if (!labels.has(`loc-${location}`)) {
        labels.set(`loc-${location}`, {
          id: `loc-${location}`,
          name: location,
          type: 'location',
          createdAt: Date.now()
        });
      }
    }
    
      // Extract flex dollar labels
      if (note.includes('VEND (MONEY)')) {
        if (note.match(/LAUNDRY/i) && !labels.has('flex-laundry')) {
          labels.set('flex-laundry', {
            id: 'flex-laundry',
            name: 'LAUNDRY',
            type: 'flex',
            createdAt: Date.now()
          });
        }
        if (note.match(/(?:REV|V1)\s*DESK|DESK/i) && !labels.has('flex-desk')) {
          labels.set('flex-desk', {
            id: 'flex-desk',
            name: 'DESK',
            type: 'flex',
            createdAt: Date.now()
          });
        }
        if (note.match(/W\s*STORE/i) && !labels.has('flex-wstore')) {
          labels.set('flex-wstore', {
            id: 'flex-wstore',
            name: 'W STORE',
            type: 'flex',
            createdAt: Date.now()
          });
        }
        if (note.match(/FLOCK/i) && !labels.has('flex-flock')) {
          labels.set('flex-flock', {
            id: 'flex-flock',
            name: 'FLOCK STOP',
            type: 'flex',
            createdAt: Date.now()
          });
        }
        if (note.match(/CAMPUS\s*PIZZA/i) && !labels.has('flex-campus-pizza')) {
          labels.set('flex-campus-pizza', {
            id: 'flex-campus-pizza',
            name: 'CAMPUS PIZZA',
            type: 'flex',
            createdAt: Date.now()
          });
        }
        if (note.match(/FARAH/i) && !labels.has('flex-farah')) {
          labels.set('flex-farah', {
            id: 'flex-farah',
            name: 'FARAH FOODS',
            type: 'flex',
            createdAt: Date.now()
          });
        }
      }
  });
  
  return Array.from(labels.values());
}

// ------------------- APP -------------------
export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isOAuthCallback, setIsOAuthCallback] = useState(false);
  const [backendReady, setBackendReady] = useState<boolean | null>(null);

  // Check backend health periodically when logged in
  useEffect(() => {
    if (!loggedIn) return;
    
    const checkBackend = async () => {
      const isHealthy = await authService.checkBackendHealth();
      setBackendReady(isHealthy);
      
      // If not ready, keep checking every 5 seconds
      if (!isHealthy) {
        setTimeout(checkBackend, 5000);
      }
    };
    
    checkBackend();
    // Also check every 30 seconds to detect if backend goes down
    const interval = setInterval(checkBackend, 30000);
    return () => clearInterval(interval);
  }, [loggedIn]);

  // Check authentication on mount
  useEffect(() => {
    console.log('Auth check starting...', { pathname: window.location.pathname });
    
    // Check if this is OAuth callback
    if (window.location.pathname === '/auth/callback') {
      console.log('OAuth callback detected');
      setIsOAuthCallback(true);
      return;
    }

    // Check for token in localStorage first
    const token = localStorage.getItem('authToken');
    console.log('Token check:', token ? 'found' : 'not found');
    
    if (token) {
      console.log('Setting logged in from token');
      setLoggedIn(true);
      setAuthChecked(true);
    } else {
      // Verify authentication
      console.log('Verifying token with server...');
      authService.verifyToken().then(({ valid, user }) => {
        console.log('Token verification result:', valid);
        setLoggedIn(valid);
        setAuthChecked(true);
      }).catch((error) => {
        console.error('Token verification error:', error);
        setLoggedIn(false);
        setAuthChecked(true);
      });
    }
  }, []);
  
  // Handle OAuth callback complete
  const handleAuthCallbackSuccess = () => {
    setIsOAuthCallback(false);
    setLoggedIn(true);
    setAuthChecked(true);
    // Clear the callback path
    window.history.replaceState({}, '', '/');
  };

  // Version flag to track when we've cleaned up old categories
  const CATEGORY_VERSION = "v5-clean"; // Increment this to force a reset
  
  const [categories, setCategories] = useState<Category[]>(() => {
    const version = localStorage.getItem("mealplan-categories-version");
    const saved = localStorage.getItem("mealplan-categories");
    
    // If version mismatch or old data exists without version, reset to defaults
    if (version !== CATEGORY_VERSION || !saved) {
      localStorage.setItem("mealplan-categories-version", CATEGORY_VERSION);
      localStorage.removeItem("mealplan-categories");
      return defaultCategories;
    }
    
    // Valid versioned data - parse and use it
    try {
      const parsed = JSON.parse(saved);
      // Filter out any invalid categories that snuck through
      const validViewIds = ["view-location", "view-mealplan-flex"];
      const invalidNames = ["coffee", "snacks", "groceries", "dining hall", "dining", "cafe", "cafes", "res halls", "residence halls", "restaurant", "restaurants"];
      
      return parsed.filter((cat: Category) => {
        // Remove categories with invalid names (case insensitive)
        if (invalidNames.includes(cat.name.toLowerCase())) {
          return false;
        }
        // Keep valid view categories and custom views
        return cat.viewId && (validViewIds.includes(cat.viewId) || cat.viewId.startsWith("view-"));
      });
    } catch {
      return defaultCategories;
    }
  });

  const [views, setViews] = useState<View[]>(() => {
    const saved = localStorage.getItem("mealplan-views");
    return saved ? JSON.parse(saved) : defaultViews;
  });

  const [selectedViewId, setSelectedViewId] = useState<string>(() => {
    const saved = localStorage.getItem("mealplan-selected-view");
    return saved || "view-mealplan-flex"; // Default to Meal Plan vs Flex view
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem("mealplan-budgets");
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(() => {
    const saved = localStorage.getItem("mealplan-selected-budget");
    return saved || null;
  });

  const [labels, setLabels] = useState<Label[]>(() => {
    const saved = localStorage.getItem("mealplan-labels");
    if (saved) {
      return JSON.parse(saved);
    }
    // Generate initial labels from transactions
    return [];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("mealplan-transactions");
    return saved ? JSON.parse(saved) : [];
  });

  // Refs to access current values in the fetch effect without causing re-renders
  const categoriesRef = useRef(categories);
  const viewsRef = useRef(views);
  useEffect(() => { categoriesRef.current = categories; }, [categories]);
  useEffect(() => { viewsRef.current = views; }, [views]);

  const [initialBalance, setInitialBalance] = useState<number>(() => {
    const saved = localStorage.getItem("mealplan-initial-balance");
    return saved ? parseFloat(saved) : 1000;
  });

  const [fundsData, setFundsData] = useState<{ mealPlanBalance: number; flexDollarsBalance: number }>({
    mealPlanBalance: 0,
    flexDollarsBalance: 0
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem("mealplan-settings");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Validate that the saved currency is still supported
      if (parsed.currency && !SUPPORTED_CURRENCIES[parsed.currency as keyof typeof SUPPORTED_CURRENCIES]) {
        return { currency: "CAD", theme: parsed.theme || "light" };
      }
      return parsed;
    }
    return { currency: "CAD", theme: "light" };
  });

  const [displayCurrency, setDisplayCurrency] = useState(settings.currency);

  // Sync display currency when settings currency changes
  useEffect(() => {
    setDisplayCurrency(settings.currency);
  }, [settings.currency]);

  // ------------------- LOCAL STORAGE -------------------
  useEffect(() => {
    localStorage.setItem("mealplan-categories", JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem("mealplan-labels", JSON.stringify(labels));
  }, [labels]);

  useEffect(() => {
    localStorage.setItem("mealplan-views", JSON.stringify(views));
  }, [views]);

  useEffect(() => {
    localStorage.setItem("mealplan-selected-view", selectedViewId);
  }, [selectedViewId]);

  useEffect(() => {
    localStorage.setItem("mealplan-budgets", JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    if (selectedBudgetId) {
      localStorage.setItem("mealplan-selected-budget", selectedBudgetId);
    } else {
      localStorage.removeItem("mealplan-selected-budget");
    }
  }, [selectedBudgetId]);

  // Ensure all views have exactly one "Other" label - this is a catch-all requirement
  useEffect(() => {
    const allViewsToCheck = views.length > 0 ? views : defaultViews;
    const missingOtherLabels: Category[] = [];
    
    allViewsToCheck.forEach(view => {
      // Count how many "Other" labels exist for this view
      const otherLabels = categories.filter(c => 
        c.viewId === view.id && c.name === "Other"
      );
      
      // If there are multiple "Other" labels, keep only the first one and remove duplicates
      if (otherLabels.length > 1) {
        const firstOther = otherLabels[0];
        const duplicateIds = otherLabels.slice(1).map(l => l.id);
        
        // Remove duplicate "Other" labels
        setCategories(prev => prev.filter(c => !duplicateIds.includes(c.id)));
        
        // Reassign transactions from duplicate "Other" labels to the first one
        setTransactions(prevTransactions => prevTransactions.map(tx => {
          const txCategoryId = tx.categoryIds?.[view.id] || tx.categoryId;
          if (duplicateIds.includes(txCategoryId)) {
            const categoryIds = { ...tx.categoryIds };
            categoryIds[view.id] = firstOther.id;
            return { ...tx, categoryIds, categoryId: tx.categoryId === txCategoryId ? firstOther.id : tx.categoryId };
          }
          return tx;
        }));
      }
      
      // If no "Other" label exists, create one
      if (otherLabels.length === 0) {
        missingOtherLabels.push({
          id: `other-${view.id}-${Date.now()}`,
          name: "Other",
          monthlyGoal: 0,
          color: "#95A5A6",
          labelIds: [],
          viewId: view.id
        });
      }
    });
    
    if (missingOtherLabels.length > 0) {
      setCategories(prev => [...prev, ...missingOtherLabels]);
      // Also update views to include the "Other" label in categoryIds
      setViews(prevViews => prevViews.map(view => {
        const otherLabel = missingOtherLabels.find(l => l.viewId === view.id);
        if (otherLabel && !view.categoryIds.includes(otherLabel.id)) {
          return { ...view, categoryIds: [...(view.categoryIds || []), otherLabel.id] };
        }
        return view;
      }));
    }
  }, [views, categories]); // Run when views or categories change

  // Auto-generate labels from transactions (but don't auto-create categories)
  // Use a ref to track if we've already processed labels to prevent infinite loops
  const labelsProcessedRef = useRef(false);
  useEffect(() => {
    if (transactions.length > 0 && !labelsProcessedRef.current) {
      labelsProcessedRef.current = true;
      // Generate labels only - categories are created manually by users
      const generatedLabels = generateLabelsFromTransactions(transactions);
      setLabels(prevLabels => {
        const existingIds = new Set(prevLabels.map(l => l.id));
        const newLabels = generatedLabels.filter(l => !existingIds.has(l.id));
        if (newLabels.length === 0) return prevLabels; // No change needed
        return [...prevLabels, ...newLabels];
      });
    }
  }, [transactions.length]); // Only depend on length, not the array itself

  // NOTE: Transactions are now stored in the database, not localStorage
  // Manual transactions should also be saved to the database via API in the future
  // For now, we keep manual transactions in localStorage for backwards compatibility
  useEffect(() => {
    // Only save manual transactions to localStorage (WatCard transactions come from API)
    const manualTransactions = transactions.filter(t => !t.id.startsWith('watcard-'));
    if (manualTransactions.length > 0) {
      localStorage.setItem("mealplan-transactions", JSON.stringify(manualTransactions));
    }
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("mealplan-initial-balance", initialBalance.toString());
  }, [initialBalance]);

  // NOTE: Funds data is now fetched from the database via API, not stored in localStorage
  // Removed localStorage saving to prevent stale data conflicts

  useEffect(() => {
    localStorage.setItem("mealplan-settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (settings.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settings.theme]);

  // ------------------- SERVER SETTINGS SYNC -------------------
  // Load settings from server when user logs in
  const settingsLoadedRef = useRef(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false); // State to trigger re-renders
  const transactionCategoryMappingsRef = useRef<Record<string, Record<string, string>>>({});
  const wasLoggedInRef = useRef(false);
  
  // Reset settings loaded state when user logs out (only on transition from logged in to logged out)
  useEffect(() => {
    if (!loggedIn && wasLoggedInRef.current) {
      // User just logged out - reset everything
      console.log('🔓 User logged out, resetting settings state');
      settingsLoadedRef.current = false;
      setSettingsLoaded(false);
      transactionCategoryMappingsRef.current = {};
    }
    wasLoggedInRef.current = loggedIn;
  }, [loggedIn]);
  
  useEffect(() => {
    const loadSettingsFromServer = async () => {
      if (!loggedIn || settingsLoadedRef.current) return;
      
      const token = localStorage.getItem('authToken');
      if (!token) return;

      try {
        console.log('📂 Loading settings from server...');
        const res = await fetch(`${API_BASE}/api/settings`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const serverSettings = await res.json();
          console.log('📂 Loaded settings:', serverSettings);
          
          // Apply server settings if they exist (don't overwrite with null/empty)
          if (serverSettings.views && serverSettings.views.length > 0) {
            setViews(serverSettings.views);
          }
          if (serverSettings.categories && serverSettings.categories.length > 0) {
            setCategories(serverSettings.categories);
          }
          if (serverSettings.budgets && serverSettings.budgets.length > 0) {
            setBudgets(serverSettings.budgets);
          }
          if (serverSettings.labels && serverSettings.labels.length > 0) {
            setLabels(serverSettings.labels);
          }
          if (serverSettings.selectedViewId) {
            setSelectedViewId(serverSettings.selectedViewId);
          }
          if (serverSettings.selectedBudgetId) {
            setSelectedBudgetId(serverSettings.selectedBudgetId);
          }
          if (serverSettings.displayCurrency) {
            setDisplayCurrency(serverSettings.displayCurrency);
          }
          // Store transaction category mappings to apply when transactions load
          if (serverSettings.transactionCategoryMappings) {
            transactionCategoryMappingsRef.current = serverSettings.transactionCategoryMappings;
            console.log('📂 Loaded transaction category mappings:', Object.keys(serverSettings.transactionCategoryMappings).length);
            
            // Apply mappings to any transactions that are already loaded
            setTransactions(prevTransactions => {
              if (prevTransactions.length === 0) return prevTransactions;
              
              const mappings = serverSettings.transactionCategoryMappings;
              let appliedCount = 0;
              const updated = prevTransactions.map(tx => {
                const savedCategoryIds = mappings[tx.id];
                if (savedCategoryIds) {
                  appliedCount++;
                  return {
                    ...tx,
                    categoryIds: savedCategoryIds,
                    categoryId: savedCategoryIds["view-location"] || savedCategoryIds["view-mealplan-flex"] || Object.values(savedCategoryIds)[0] || tx.categoryId
                  };
                }
                return tx;
              });
              
              if (appliedCount > 0) {
                console.log(`📂 Applied saved category mappings to ${appliedCount} existing transactions`);
              }
              return updated;
            });
          }
          
          settingsLoadedRef.current = true;
          setSettingsLoaded(true);
          console.log('✅ Settings loaded from server');
        } else {
          // Even if no settings exist yet, mark as loaded so we can start saving
          settingsLoadedRef.current = true;
          setSettingsLoaded(true);
          console.log('📂 No existing settings on server, starting fresh');
        }
      } catch (err) {
        console.error('Failed to load settings from server:', err);
        // Still mark as loaded so we can save settings
        settingsLoadedRef.current = true;
        setSettingsLoaded(true);
      }
    };

    loadSettingsFromServer();
  }, [loggedIn]);

  // Save settings to server when they change (debounced)
  const saveTimeoutRef = useRef<number | null>(null);
  useEffect(() => {
    // Don't save until we've loaded settings first (prevent overwriting server data)
    if (!loggedIn) {
      console.log('🔒 Not saving settings: not logged in');
      return;
    }
    if (!settingsLoadedRef.current) {
      console.log('⏳ Not saving settings: settings not loaded yet');
      return;
    }
    
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.log('🔑 Not saving settings: no auth token');
      return;
    }

    console.log('📝 Settings change detected, will save in 2s...');

    // Build transaction category mappings immediately (don't wait for debounce)
    const transactionCategoryMappings: Record<string, Record<string, string>> = {};
    transactions.forEach(tx => {
      if (tx.categoryIds && Object.keys(tx.categoryIds).length > 0) {
        transactionCategoryMappings[tx.id] = tx.categoryIds;
      }
    });
    
    // Debug: Log a sample to see what we're saving
    const sampleTx = transactions.find(tx => tx.categoryIds && Object.keys(tx.categoryIds).length > 0);
    if (sampleTx) {
      console.log('📝 Sample transaction categoryIds being saved:', sampleTx.id, sampleTx.categoryIds);
    }

    // Only update the ref if we have actual mappings (don't overwrite loaded mappings with empty)
    // This prevents the save effect from clearing mappings loaded from server before WatCard fetch runs
    if (Object.keys(transactionCategoryMappings).length > 0) {
      transactionCategoryMappingsRef.current = transactionCategoryMappings;
    }

    // Debounce save - wait 2 seconds after last change
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(async () => {
      try {
        console.log('💾 Saving settings to server...');
        console.log(`📊 Saving ${Object.keys(transactionCategoryMappings).length} transaction category mappings`);

        const settingsToSave = {
          views,
          categories,
          budgets,
          labels,
          selectedViewId,
          selectedBudgetId,
          displayCurrency,
          transactionCategoryMappings
        };

        const res = await fetch(`${API_BASE}/api/settings`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(settingsToSave)
        });

        if (res.ok) {
          console.log('✅ Settings saved to server');
        } else {
          console.error('Failed to save settings:', await res.text());
        }
      } catch (err) {
        console.error('Failed to save settings to server:', err);
      }
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [loggedIn, views, categories, budgets, labels, selectedViewId, selectedBudgetId, displayCurrency, transactions]);

  // Extension gets auth token directly from localStorage via content script
  // No chrome.storage sync needed - content.js responds to getAuthToken/getUserInfo messages

  // ------------------- FETCH WATCARD TRANSACTIONS -------------------
  const isFetchingRef = useRef(false);
  const hasFetchedOnceRef = useRef(false);
  useEffect(() => {
    const fetchWatCardTransactions = async () => {
      // Wait for settings to load first (so we have transaction category mappings)
      if (!settingsLoadedRef.current) {
        console.log("⏳ Waiting for settings to load before fetching transactions...");
        return;
      }
      
      // Prevent concurrent fetches
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.log("No auth token available");
          isFetchingRef.current = false;
          return;
        }

        const res = await fetch(`${API_BASE}/api/data`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) {
          console.log("Failed to fetch WatCard data");
          isFetchingRef.current = false;
          return;
        }

        const data = await res.json();
        if (!data.transactions || !Array.isArray(data.transactions)) {
          console.log("No transactions in response");
          isFetchingRef.current = false;
          return;
        }

        // Use refs to get current values without triggering re-renders
        const currentCategories = categoriesRef.current;
        const currentViews = viewsRef.current;

        console.log(`Fetched ${data.transactions.length} WatCard transactions from MySQL`);

        // Helper function to parse location label from transaction
        const parseLocationLabel = (tx: any): string => {
          const terminal = tx.terminal || '';
          const type = tx.type || '';
          
          // Check for POS-FS- pattern - extract the third word (location code)
          const posFsMatch = terminal.match(/POS-FS-(\w+)/i) || type.match(/POS-FS-(\w+)/i);
          if (posFsMatch) {
            return posFsMatch[1].toUpperCase(); // REV, DP, SLC, CMH, V1, etc.
          }
          
          // Handle VEND (MONEY) - flex dollar transactions with hardcoded labels
          if (type.includes('VEND (MONEY)') || terminal.includes('VEND (MONEY)')) {
            if (terminal.includes('LAUNDRY') || type.includes('LAUNDRY')) return 'LAUNDRY';
            if (terminal.match(/FLOCK/i) || type.match(/FLOCK/i)) return 'FLOCK STOP';
            if (terminal.match(/CAMPUS\s*PIZZA/i) || type.match(/CAMPUS\s*PIZZA/i)) return 'CAMPUS PIZZA';
            if (terminal.match(/FARAH/i) || type.match(/FARAH/i)) return 'FARAH FOODS';
            if (terminal.match(/W\s*STORE/i) || type.match(/W\s*STORE/i)) return 'W STORE';
            if (terminal.match(/DESK/i) || type.match(/DESK/i)) return 'DESK';
            return 'FLEX OTHER';
          }
          
          // Handle FINANCIAL VEND - try to extract location
          if (type.includes('FINANCIAL VEND') || terminal.includes('FINANCIAL VEND')) {
            const finMatch = terminal.match(/POS-FS-(\w+)/i) || type.match(/POS-FS-(\w+)/i);
            if (finMatch) return finMatch[1].toUpperCase();
            return 'MEAL PLAN';
          }
          
          return 'Other';
        };

        // Collect all unique location labels from transactions
        const locationLabels = new Set<string>();
        data.transactions.forEach((tx: any) => {
          const label = parseLocationLabel(tx);
          if (label && label !== 'Other') {
            locationLabels.add(label);
          }
        });
        
        // Create any missing location categories
        let categoriesToAdd: Category[] = [];
        let colorCounter = 0;
        locationLabels.forEach(label => {
          const exists = currentCategories.some(c => 
            c.viewId === "view-location" && c.name === label
          );
          if (!exists) {
            const colorIndex = colorCounter % PRESET_COLORS.length;
            colorCounter++;
            categoriesToAdd.push({
              id: `loc-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
              name: label,
              monthlyGoal: 0,
              color: PRESET_COLORS[colorIndex],
              labelIds: [],
              viewId: "view-location"
            });
          }
        });
        
        // Add new categories if any
        if (categoriesToAdd.length > 0) {
          const updatedCategories = [...currentCategories, ...categoriesToAdd];
          setCategories(updatedCategories);
          categoriesRef.current = updatedCategories;
        }
        
        // Now use the updated categories ref
        const allCategories = categoriesRef.current;
        
        let watCardTransactions: Transaction[] = data.transactions
          .filter((tx: any) => {
            // Filter out PREPAYMENT (ADMIN) and ACCOUNT ADJUSTMENT
            const type = tx.type || '';
            const terminal = tx.terminal || '';
            return !type.includes('PREPAYMENT (ADMIN)') && 
                   !type.includes('ACCOUNT ADJUSTMENT') &&
                   !terminal.includes('PREPAYMENT (ADMIN)') &&
                   !terminal.includes('ACCOUNT ADJUSTMENT');
          })
          .map((tx: any, index: number) => {
            // Parse the amount to get positive number
            const amountStr = tx.amount.replace('$', '').replace('-', '');
            const amount = parseFloat(amountStr);

            // Map category from WatCard to existing categories
            // Include time in note if available (extract from dateTime)
            const timePart = tx.dateTime.includes(' ') ? tx.dateTime.split(' ')[1] : '';
            const note = timePart 
              ? `${tx.type} at ${tx.terminal} : ${timePart}`.trim()
              : `${tx.type} at ${tx.terminal}`.trim();
            
            // Parse location label from transaction string
            const locationLabel = parseLocationLabel(tx);

            // Determine if this is a meal plan or flex transaction
            const isMealPlan = note.match(/POS-FS-/i) || note.includes('FINANCIAL VEND');
            const isFlex = note.includes('VEND (MONEY)');
            
            // Assign category for each view
            const categoryIds: Record<string, string> = {};
            
            // Get all views (use refs for current values)
            const allViews = currentViews.length > 0 ? currentViews : defaultViews;
            
            allViews.forEach(view => {
              let viewCategoryId: string | null = null;
              
              if (view.id === "view-location") {
                // Location view: match category by parsed location label
                if (locationLabel && locationLabel !== 'Other') {
                  const locationCategory = allCategories.find(c => 
                    c.viewId === "view-location" && 
                    c.name === locationLabel
                  );
                  if (locationCategory) {
                    viewCategoryId = locationCategory.id;
                  }
                }
              } else if (view.id === "view-mealplan-flex") {
                // Meal plan vs flex view: assign based on transaction type
                // For default views, NOTHING should go to Other
                if (isFlex) {
                  // VEND (MONEY) = Flex Dollars
                  const flexCategory = allCategories.find(c => 
                    c.viewId === "view-mealplan-flex" && c.id === "mp-flex"
                  );
                  viewCategoryId = flexCategory?.id || null;
                } else {
                  // Everything else (POS-FS, FINANCIAL VEND, etc.) = Meal Plan
                  const mealPlanCategory = allCategories.find(c => 
                    c.viewId === "view-mealplan-flex" && c.id === "mp-mealplan"
                  );
                  viewCategoryId = mealPlanCategory?.id || null;
                }
              }
              
              // Fallback to "Other" for this view - ALL views should have an "Other" label
              if (!viewCategoryId) {
                const otherCategory = allCategories.find(c => 
                  c.viewId === view.id && c.name === "Other"
                );
                if (otherCategory) {
                  viewCategoryId = otherCategory.id;
                } else {
                  // If "Other" doesn't exist, this is an error - it should always exist
                  // We'll create a temporary ID and log a warning
                  // The proper fix is to ensure "Other" is created when views are created
                  console.error(`"Other" label not found for view ${view.id}. This should not happen. Creating temporary fallback.`);
                  // Use a fallback ID - this will be fixed when the view is properly initialized
                  viewCategoryId = `other-${view.id}-fallback`;
                }
              }
              
              // Always assign a category - ensure every transaction has a label
              if (viewCategoryId) {
                categoryIds[view.id] = viewCategoryId;
              }
            });
            
            // Use location view category as legacy categoryId for backwards compatibility
            const legacyCategoryId = categoryIds["view-location"] || categoryIds["view-mealplan-flex"] || Object.values(categoryIds)[0] || "";

            // Create a stable ID that doesn't depend on array order
            // Use dateTime + amount + terminal to create unique identifier
            const stableId = `watcard-${tx.dateTime}-${amountStr}-${(tx.terminal || '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 20)}`;

            return {
              id: stableId,
              amount,
              date: tx.dateTime.split(' ')[0], // Extract date part
              categoryId: legacyCategoryId,
              categoryIds,
              type: "expense" as const,
              note
            };
          });

        // Apply saved category mappings from server settings
        const savedMappings = transactionCategoryMappingsRef.current;
        console.log(`📂 Checking saved mappings: ${Object.keys(savedMappings).length} mappings in ref`);
        if (Object.keys(savedMappings).length > 0) {
          console.log(`📂 Have ${Object.keys(savedMappings).length} saved category mappings to apply`);
          // Debug: Log a sample mapping to see structure
          const sampleKey = Object.keys(savedMappings)[0];
          if (sampleKey) {
            console.log(`📂 Sample saved mapping for ${sampleKey}:`, savedMappings[sampleKey]);
          }
          let appliedCount = 0;
          let shwarmaCount = 0;
          watCardTransactions = watCardTransactions.map(tx => {
            const savedCategoryIds = savedMappings[tx.id];
            if (savedCategoryIds) {
              appliedCount++;
              // Check if any category in the saved mappings is the shwarma category
              if (Object.values(savedCategoryIds).some(catId => catId === '1764493443971')) {
                shwarmaCount++;
                console.log(`📂 Transaction ${tx.id} has shwarma category in saved mappings`);
              }
              // Use saved category assignments instead of auto-detected ones
              return {
                ...tx,
                categoryIds: savedCategoryIds,
                categoryId: savedCategoryIds["view-location"] || savedCategoryIds["view-mealplan-flex"] || Object.values(savedCategoryIds)[0] || tx.categoryId
              };
            }
            return tx;
          });
          console.log(`📂 Applied saved category mappings to ${appliedCount} of ${watCardTransactions.length} transactions`);
          console.log(`📂 Found ${shwarmaCount} transactions with shwarma category`);
        }

        // Merge with current state transactions (filter out old WatCard transactions first)
        setTransactions(currentTransactions => {
          // Save existing categoryIds from current state (includes unsaved changes)
          const existingMappings = new Map();
          currentTransactions.forEach(tx => {
            if (tx.categoryIds && Object.keys(tx.categoryIds).length > 0) {
              existingMappings.set(tx.id, tx.categoryIds);
            }
          });

          const manualOnly = currentTransactions.filter(t => !t.id.startsWith('watcard-'));

          // Apply existing categoryIds to fresh WatCard transactions
          const watCardWithPreservedCategories = watCardTransactions.map(tx => {
            const existingCategories = existingMappings.get(tx.id);
            if (existingCategories) {
              // Preserve existing categoryIds (includes unsaved changes)
              return {
                ...tx,
                categoryIds: existingCategories,
                categoryId: existingCategories["view-location"] || existingCategories["view-mealplan-flex"] || Object.values(existingCategories)[0] || tx.categoryId
              };
            }
            return tx;
          });

          const merged = [...manualOnly, ...watCardWithPreservedCategories];
          console.log(`Total transactions after merge: ${merged.length} (${manualOnly.length} manual + ${watCardWithPreservedCategories.length} WatCard)`);

          const preservedCount = watCardWithPreservedCategories.filter(tx => existingMappings.has(tx.id)).length;
          if (preservedCount > 0) {
            console.log(`✅ Preserved categoryIds for ${preservedCount} transactions during merge`);
          }

          return merged;
        });
      } catch (err) {
        console.error("Failed to fetch WatCard transactions:", err);
      } finally {
        isFetchingRef.current = false;
      }
    };

    // Fetch on mount and every 30 seconds (but wait for settings to load first)
    fetchWatCardTransactions();
    const interval = setInterval(fetchWatCardTransactions, 30000);
    return () => clearInterval(interval);
  }, [settingsLoaded]); // Re-run when settings finish loading

  // Fetch funds data
  useEffect(() => {
    const fetchFunds = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.log("No auth token available for funds fetch");
          return;
        }

        const res = await fetch(`${API_BASE}/api/funds`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setFundsData({
            mealPlanBalance: data.mealPlanBalance || 0,
            flexDollarsBalance: data.flexDollarsBalance || 0
          });
        }
      } catch (err) {
        console.error("Failed to fetch funds:", err);
      }
    };

    fetchFunds();
    const interval = setInterval(fetchFunds, 30000);
    return () => clearInterval(interval);
  }, []);

  // ------------------- RENDER -------------------
  // Handle OAuth callback
  if (isOAuthCallback) {
    return <AuthCallback onSuccess={handleAuthCallbackSuccess} />;
  }

  // Show loading while checking auth
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!loggedIn) {
    return <LoginPage onLoginSuccess={() => setLoggedIn(true)} />;
  }

  return (
    <AppContext.Provider
      value={{
        categories,
        setCategories,
        transactions,
        setTransactions,
        settings,
        setSettings,
        initialBalance,
        setInitialBalance,
        displayCurrency,
        setDisplayCurrency,
        fundsData,
        setFundsData,
        labels,
        setLabels,
        views,
        setViews,
        selectedViewId,
        setSelectedViewId,
        budgets,
        setBudgets,
        selectedBudgetId,
        setSelectedBudgetId,
      }}
    >
      <div
        className="min-h-screen transition-colors"
        style={{ backgroundColor: settings.theme === 'dark' ? '#000000' : '#f9fafb' }}
      >
        {/* Backend startup warning banner */}
        {backendReady === false && (
          <div className="bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800 px-3 py-2.5 sm:px-4 sm:py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-amber-800 dark:text-amber-200">
              <svg className="animate-spin h-4 w-4 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-xs sm:text-sm font-medium">Backend is starting up... Please wait 1-2 minutes. Data may not load until the server is ready.</span>
            </div>
          </div>
        )}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                  {settings.theme === 'dark' ? (
                    <img
                      src="./icon/watspend_darkmode_icon.png"
                      alt="Watspend logo (dark)"
                      aria-hidden="true"
                      className="block"
                    />
                  ) : (
                    <img
                      src="./icon/watspend_lightmode_icon.png"
                      alt="Watspend logo (light)"
                      aria-hidden="true"
                      className="block"
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">WELCOME BACK WARRIOR!</h1>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                    Track your campus spending • {displayCurrency} ({SUPPORTED_CURRENCIES[displayCurrency as keyof typeof SUPPORTED_CURRENCIES]})
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="grid w-full max-w-2xl grid-cols-4 mx-auto">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="transactions" className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                <span className="hidden sm:inline">Transactions</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Reports</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <SettingsIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <DashboardOverview />
            </TabsContent>

            <TabsContent value="transactions">
              <TransactionManager />
            </TabsContent>

            <TabsContent value="reports">
              <MonthlyReport />
            </TabsContent>

            <TabsContent value="settings">
              <Settings />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AppContext.Provider>
  );
}