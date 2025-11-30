import { useAppContext } from "../App";
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import React, { useState, useEffect } from "react";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import { Moon, Sun, DollarSign, RefreshCw, User } from "lucide-react";
import { SUPPORTED_CURRENCIES, convertCurrency } from "../utils/currency";

// Default categories for reset - matches the views system
// Location view: Only "Other" - labels created dynamically from transaction strings
const defaultLocationCategories = [
  { id: "loc-other", name: "Other", monthlyGoal: 0, color: "#95A5A6", labelIds: [], viewId: "view-location" }
];

// Meal Plan vs Flex view: Two main labels
const defaultMealplanFlexCategories = [
  { id: "mp-mealplan", name: "Meal Plan", monthlyGoal: 0, color: "#00D9FF", labelIds: [], viewId: "view-mealplan-flex" },
  { id: "mp-flex", name: "Flex Dollars", monthlyGoal: 0, color: "#FF1493", labelIds: [], viewId: "view-mealplan-flex" },
  { id: "mp-other", name: "Other", monthlyGoal: 0, color: "#95A5A6", labelIds: [], viewId: "view-mealplan-flex" }
];

const defaultCategories = [...defaultLocationCategories, ...defaultMealplanFlexCategories];

const defaultViews = [
  { id: "view-location", name: "By Location", type: "location", categoryIds: ["loc-other"] },
  { id: "view-mealplan-flex", name: "Meal Plan vs Flex", type: "mealplan-flex", categoryIds: ["mp-mealplan", "mp-flex", "mp-other"] }
];

export function Settings() {
  const {
    settings,
    setSettings,
    initialBalance,
    setInitialBalance,
    setTransactions,
    setCategories,
    setViews,
    setLabels,
    displayCurrency,
    setDisplayCurrency,
    fundsData,
    setFundsData,
  } = useAppContext();

  // Get user email from localStorage
  const [userEmail, setUserEmail] = useState<string>('');
  
  useEffect(() => {
    const loadUserEmail = () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setUserEmail(user.email || '');
        } catch {
          setUserEmail('');
        }
      } else {
        setUserEmail('');
      }
    };
    
    // Load on mount
    loadUserEmail();
    
    // Also listen for storage changes (for cross-tab updates)
    window.addEventListener('storage', loadUserEmail);
    
    // Check every 2 seconds in case localStorage was updated in this tab
    const interval = setInterval(loadUserEmail, 2000);
    
    return () => {
      window.removeEventListener('storage', loadUserEmail);
      clearInterval(interval);
    };
  }, []);

  // Calculate actual current balance from fundsData
  const currentTotalBalance = fundsData.mealPlanBalance + fundsData.flexDollarsBalance;

  // State for balance adjustment type
  const [balanceType, setBalanceType] = useState<'mealplan' | 'flex'>('mealplan');
  const [balanceInputValue, setBalanceInputValue] = useState<string>('');

  // Update input value when balance type or display currency changes
  useEffect(() => {
    const updateBalanceValue = async () => {
      const currentBalanceCAD = balanceType === 'mealplan' 
        ? fundsData.mealPlanBalance 
        : fundsData.flexDollarsBalance;
      
      if (currentBalanceCAD > 0) {
        // Convert from CAD to display currency
        if (displayCurrency === 'CAD') {
          setBalanceInputValue(currentBalanceCAD.toFixed(2));
        } else {
          const conversion = await convertCurrency(currentBalanceCAD, 'CAD', displayCurrency);
          if (conversion) {
            setBalanceInputValue(conversion.converted.toFixed(2));
          } else {
            // Fallback to CAD value if conversion fails
            setBalanceInputValue(currentBalanceCAD.toFixed(2));
          }
        }
      } else {
        setBalanceInputValue('');
      }
    };
    
    updateBalanceValue();
  }, [balanceType, fundsData, displayCurrency]);

  const handleThemeToggle = (checked: boolean) => {
    setSettings({ ...settings, theme: checked ? "dark" : "light" });
  };

  const handleCurrencyChange = (currency: string) => {
    setSettings({ ...settings, currency });
    setDisplayCurrency(currency); // Also update the display currency
  };

  const handleBalanceUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const inputValue = parseFloat(formData.get("balance") as string);
    if (!isNaN(inputValue) && inputValue >= 0) {
      // Convert from display currency back to CAD for storage
      let balanceInCAD = inputValue;
      if (displayCurrency !== 'CAD') {
        const conversion = await convertCurrency(inputValue, displayCurrency, 'CAD');
        if (conversion) {
          balanceInCAD = conversion.converted;
        }
        // If conversion fails, assume the input is already in CAD
      }
      
      if (balanceType === 'mealplan') {
        setFundsData({
          ...fundsData,
          mealPlanBalance: balanceInCAD
        });
      } else {
        setFundsData({
          ...fundsData,
          flexDollarsBalance: balanceInCAD
        });
      }
      // Also update initialBalance for backwards compatibility
      setInitialBalance(balanceInCAD);
    }
  };

  const handleResetData = () => {
    if (
      confirm(
        "Are you sure you want to reset all data? This will delete all transactions and labels, restoring default views. Location labels will be recreated automatically from your WatCard data. This action cannot be undone."
      )
    ) {
      // Clear localStorage
      localStorage.removeItem("mealplan-categories");
      localStorage.removeItem("mealplan-categories-version");
      localStorage.removeItem("mealplan-views");
      localStorage.removeItem("mealplan-labels");
      localStorage.removeItem("mealplan-transactions");
      
      // Reset to proper defaults
      setTransactions([]);
      setCategories(defaultCategories);
      setViews(defaultViews);
      setLabels([]);
      setInitialBalance(1000);
      
      alert("Data reset complete! The page will now reload.");
      window.location.reload();
    }
  };

  // Helper function to get currency symbols
  function getCurrencySymbol(currency: string) {
    const symbols: { [key: string]: string } = {
      USD: "$",
      CAD: "C$",
      EUR: "€",
      GBP: "£",
      JPY: "¥",
      AUD: "A$",
      CNY: "¥",
      RWF: "RF",
    };
    return symbols[currency] || "$";
  }

  // Helper function to format currency display
  function formatCurrencyOption(currencyCode: string) {
    const symbol = getCurrencySymbol(currencyCode);
    const name = SUPPORTED_CURRENCIES[currencyCode as keyof typeof SUPPORTED_CURRENCIES] || currencyCode;
    return `${currencyCode} - ${name} (${symbol})`;
  }

  // Get all currency codes from SUPPORTED_CURRENCIES
  const currencyCodes = Object.keys(SUPPORTED_CURRENCIES);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Card className="p-4 sm:p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-lg">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">Settings</h3>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-6">
          Customize your dashboard preferences
        </p>

        <div className="space-y-6">
          {/* Account Management */}
          <div className="pb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <Label className="text-gray-900 dark:text-white">Account Management</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Manage your account settings and security
                </p>
                
                <div className="space-y-3 max-w-md">
                  {/* Show logged in email */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Logged in as</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {userEmail || 'Not logged in'}
                    </p>
                  </div>
                  
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" variant="outline" onClick={() => {
                      if (confirm('Are you sure you want to log out?')) {
                        localStorage.removeItem('authToken');
                        localStorage.removeItem('user');
                        window.location.reload();
                      }
                    }}>
                      Logout
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => {
                      if (confirm('⚠️ WARNING: This will permanently delete your account and ALL data including transactions, budgets, and settings. This action CANNOT be undone. Are you absolutely sure?')) {
                        // Clear all localStorage data
                        localStorage.clear();
                        
                        // TODO: Call backend API to delete user account from database
                        // fetch('http://localhost:4000/api/auth/delete-account', {
                        //   method: 'DELETE',
                        //   headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
                        // });
                        
                        alert('Account deleted. You will now be logged out.');
                        window.location.reload();
                      }
                    }}>
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center justify-between pb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                {settings.theme === "dark" ? (
                  <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Sun className="w-5 h-5 text-gray-600" />
                )}
              </div>
              <div>
                <Label htmlFor="theme-toggle" className="text-gray-900 dark:text-white">
                  Dark Mode
                </Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Toggle between light and dark theme
                </p>
              </div>
            </div>
            <Switch
              id="theme-toggle"
              checked={settings.theme === "dark"}
              onCheckedChange={handleThemeToggle}
            />
          </div>

          {/* Currency Selection - UPDATED */}
          <div className="pb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1">
                <Label htmlFor="currency-select" className="text-gray-900 dark:text-white">
                  Currency
                </Label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Select your preferred currency for the entire app
                </p>
                <Select value={settings.currency} onValueChange={handleCurrencyChange}>
                  <SelectTrigger id="currency-select" className="max-w-xs bg-white dark:bg-white text-black border-gray-300 h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencyCodes.map((currencyCode) => (
                      <SelectItem key={currencyCode} value={currencyCode}>
                        {formatCurrencyOption(currencyCode)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  This sets the currency for all transactions, reports, and dashboard.
                  {displayCurrency !== settings.currency && (
                    <span className="text-blue-600 dark:text-blue-400 ml-1">
                      Currently displaying: {displayCurrency}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Manual Balance Adjustment */}
          <div className="pb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="flex-1">
                <Label className="text-gray-900 dark:text-white">
                  Manual Balance Adjustment
                </Label>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-3">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium mb-1">
                    ⚠️ Warning: Manual Adjustment
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                    Changing this balance will override automatic WatCard syncing. Use this only if your actual balance differs from what's displayed. This change is permanent and cannot be undone automatically.
                  </p>
                </div>
                
                {/* Balance Type Selection */}
                <div className="mb-3">
                  <Label className="text-gray-900 dark:text-white text-sm mb-2 block">Balance Type</Label>
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="balance-mealplan"
                        name="balance-type"
                        value="mealplan"
                        checked={balanceType === "mealplan"}
                        onChange={(e) => setBalanceType(e.target.value as "mealplan" | "flex")}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="balance-mealplan" className="cursor-pointer text-gray-900 dark:text-white">
                        Meal Plan
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="balance-flex"
                        name="balance-type"
                        value="flex"
                        checked={balanceType === "flex"}
                        onChange={(e) => setBalanceType(e.target.value as "mealplan" | "flex")}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="balance-flex" className="cursor-pointer text-gray-900 dark:text-white">
                        Flex Dollars
                      </Label>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleBalanceUpdate} className="flex gap-2 max-w-xs">
                  <Input
                    id="initial-balance"
                    name="balance"
                    type="number"
                    step="0.01"
                    min="0"
                    value={balanceInputValue}
                    onChange={(e) => setBalanceInputValue(e.target.value)}
                    placeholder="e.g., 1000"
                    className="bg-white dark:bg-white text-black border-gray-300 h-10"
                  />
                  <Button type="submit" variant="outline" className="h-10">Update</Button>
                </form>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Current {balanceType === 'mealplan' ? 'Meal Plan' : 'Flex'} Balance: {getCurrencySymbol(settings.currency)}
                  {(balanceType === 'mealplan' ? fundsData.mealPlanBalance : fundsData.flexDollarsBalance).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Reset Data */}
          <div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <Label className="text-gray-900 dark:text-white">Reset All Data</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Delete all transactions and restore default categories
                </p>
                <Button variant="destructive" onClick={handleResetData}>
                  Reset Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

    </div>
  );
}