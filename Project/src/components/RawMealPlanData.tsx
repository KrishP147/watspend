import React, { useEffect, useState } from "react";
import { useAppContext } from "../App";
import { convertCurrency, SUPPORTED_CURRENCIES } from "../utils/currency";

// Define the structure of each transaction
interface Transaction {
  dateTime: string;
  type: string;
  terminal: string;
  status: string;
  balance: string;
  units: string;
  amount: string;
}

// Define the shape of the full snapshot
interface MealPlanSnapshot {
  timestamp: string;
  transactionCount: number;
  transactions: Transaction[];
}

const MealPlanDashboard: React.FC = () => {
  const { transactions, setTransactions, settings } = useAppContext();
  const [data, setData] = useState<MealPlanSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [displayCurrency, setDisplayCurrency] = useState(settings?.currency || "CAD");
  const [convertedData, setConvertedData] = useState<MealPlanSnapshot | null>(null);

  // Helper function to get currency symbol
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

  // Convert amounts when currency changes
  useEffect(() => {
    const convertAmounts = async () => {
      if (!data || displayCurrency === settings?.currency) {
        setConvertedData(data);
        return;
      }

      try {
        // Convert transaction amounts
        const convertedTransactions = await Promise.all(
          data.transactions.map(async (transaction) => {
            // Extract numeric value from amount string (e.g., "$5.50" -> 5.50)
            const amountMatch = transaction.amount.match(/[+-]?(\d+\.?\d*)/);
            const amount = amountMatch ? parseFloat(amountMatch[0]) : 0;
            
            // Extract numeric value from balance string
            const balanceMatch = transaction.balance.match(/[+-]?(\d+\.?\d*)/);
            const balance = balanceMatch ? parseFloat(balanceMatch[0]) : 0;

            // Convert amounts
            const convertedAmount = await convertCurrency(
              Math.abs(amount), 
              settings?.currency || "CAD", 
              displayCurrency
            );
            
            const convertedBalance = await convertCurrency(
              balance, 
              settings?.currency || "CAD", 
              displayCurrency
            );

            return {
              ...transaction,
              amount: `${amount < 0 ? '-' : ''}${getCurrencySymbol(displayCurrency)}${convertedAmount?.converted?.toFixed(2) || amount.toFixed(2)}`,
              balance: `${getCurrencySymbol(displayCurrency)}${convertedBalance?.converted?.toFixed(2) || balance.toFixed(2)}`
            };
          })
        );

        setConvertedData({
          ...data,
          transactions: convertedTransactions
        });
      } catch (error) {
        console.error("Failed to convert amounts:", error);
        setConvertedData(data);
      }
    };

    convertAmounts();
  }, [data, displayCurrency, settings?.currency]);

  // Fetch data from local API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/data");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        
        // Handle case where server returns empty array or invalid data
        if (Array.isArray(json)) {
          // Server returned empty array, create valid snapshot structure
          const emptyData = {
            timestamp: new Date().toISOString(),
            transactionCount: 0,
            transactions: [],
          };
          setData(emptyData);
          setConvertedData(emptyData);
        } else if (json && typeof json === 'object' && Array.isArray(json.transactions)) {
          // Valid snapshot structure
          setData(json as MealPlanSnapshot);
          setConvertedData(json as MealPlanSnapshot);
        } else {
          // Invalid data structure
          const emptyData = {
            timestamp: new Date().toISOString(),
            transactionCount: 0,
            transactions: [],
          };
          setData(emptyData);
          setConvertedData(emptyData);
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch data");
      }
    };

    fetchData();

    // Optional: refresh automatically every 30 seconds
    const interval = setInterval(fetchData, 30_000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="p-4 text-red-600">
        <h2>Error loading data 😢</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 text-gray-600 animate-pulse">
        <p>Loading meal plan data...</p>
      </div>
    );
  }

  const displayData = convertedData || data;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Meal Plan Dashboard</h1>
        
        {/* Currency Selector */}
        <div className="w-48">
          <label htmlFor="raw-currency-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Display Currency
          </label>
          <select
            id="raw-currency-select"
            value={displayCurrency}
            onChange={(e) => setDisplayCurrency(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            {Object.keys(SUPPORTED_CURRENCIES).map((currencyCode) => (
              <option key={currencyCode} value={currencyCode}>
                {currencyCode} - {SUPPORTED_CURRENCIES[currencyCode as keyof typeof SUPPORTED_CURRENCIES]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-6">
        Last updated:{" "}
        <span className="font-medium">
          {new Date(displayData.timestamp).toLocaleString()}
        </span>{" "}
        | Total transactions:{" "}
        <span className="font-medium">{displayData.transactionCount}</span>
        {displayCurrency !== settings?.currency && (
          <span className="ml-2 text-blue-600 dark:text-blue-400">
            (Converted from {settings?.currency})
          </span>
        )}
      </p>

      <div className="overflow-x-auto border rounded-lg shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700">
        <table className="min-w-full text-sm text-left border-collapse">
          <thead className="bg-gray-100 dark:bg-gray-700 border-b dark:border-gray-600">
            <tr>
              <th className="px-4 py-2 dark:text-gray-200">Date</th>
              <th className="px-4 py-2 dark:text-gray-200">Type</th>
              <th className="px-4 py-2 dark:text-gray-200">Terminal</th>
              <th className="px-4 py-2 dark:text-gray-200">Status</th>
              <th className="px-4 py-2 text-right dark:text-gray-200">Amount</th>
              <th className="px-4 py-2 text-right dark:text-gray-200">Balance</th>
            </tr>
          </thead>
          <tbody>
            {displayData.transactions && displayData.transactions.length > 0 ? (
              displayData.transactions.map((t, i) => (
              <tr key={i} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 py-2 dark:text-gray-300">{t.dateTime}</td>
                <td className="px-4 py-2 dark:text-gray-300">{t.type.trim()}</td>
                <td className="px-4 py-2 dark:text-gray-300">{t.terminal.trim()}</td>
                <td
                  className={`px-4 py-2 ${
                    t.status === "Approved"
                      ? "text-green-600 dark:text-green-400"
                      : "text-yellow-600 dark:text-yellow-400"
                  }`}
                >
                  {t.status}
                </td>
                <td className="px-4 py-2 text-right dark:text-gray-300">{t.amount}</td>
                <td className="px-4 py-2 text-right dark:text-gray-300">{t.balance}</td>
              </tr>
            ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  No transactions found. Upload data using the extension to see transactions here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MealPlanDashboard;