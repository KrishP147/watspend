import React, { useEffect, useState } from "react";
import { useAppContext, Transaction } from "../App";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { Plus, ArrowUpCircle, ArrowDownCircle, Trash2, RefreshCw, Edit, Download, Search, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { convertCurrency, SUPPORTED_CURRENCIES } from "../utils/currency";
import { ExportDialog } from "./export-dialog";

// Add this interface for converted transactions
interface ConvertedTransaction extends Transaction {
  displayAmount?: number;
}

export function TransactionManager() {
  const { 
    categories, 
    transactions, 
    setTransactions, 
    settings, 
    setSettings, 
    displayCurrency, 
    setDisplayCurrency,
    views,
    selectedViewId,
    setSelectedViewId
  } = useAppContext();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [dateRange, setDateRange] = useState<string>("all"); // day, week, month, year, all
  const [currentPage, setCurrentPage] = useState(1);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedTransactions, setConvertedTransactions] = useState<ConvertedTransaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [labelFilter, setLabelFilter] = useState<string>("all");
  const itemsPerPage = 50;

  // Get categories for selected view
  const viewCategories = categories.filter(cat => cat.viewId === selectedViewId);

  const [formData, setFormData] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    categoryId: viewCategories[0]?.id || categories[0]?.id || "",
    categoryIds: {} as Record<string, string>, // Map of viewId -> categoryId
    type: "expense" as "expense" | "income",
    note: "",
  });

  // When display currency changes in transactions, also update settings
  const handleDisplayCurrencyChange = (newCurrency: string) => {
    setDisplayCurrency(newCurrency);
    // Also update the settings currency so it persists
    setSettings({ ...settings, currency: newCurrency });
  };

  // Convert transactions when display currency changes or transactions update
  useEffect(() => {
    const convertAllTransactions = async () => {
      if (displayCurrency === "CAD") {
        // Same currency, no conversion needed - use original amounts
        const sameCurrencyTransactions = transactions.map(t => ({
          ...t,
          displayAmount: t.amount
        }));
        setConvertedTransactions(sameCurrencyTransactions);
        return;
      }

      setIsConverting(true);
      try {
        const converted = await Promise.all(
          transactions.map(async (transaction) => {
            const result = await convertCurrency(
              transaction.amount,
              "CAD", // Convert FROM CAD (base currency)
              displayCurrency // Convert TO display currency
            );
            
            if (result) {
              return {
                ...transaction,
                displayAmount: result.converted // This is the converted amount to show
              };
            } else {
              // If conversion fails, fall back to original amount
              return {
                ...transaction,
                displayAmount: transaction.amount
              };
            }
          })
        );
        setConvertedTransactions(converted);
      } catch (error) {
        console.error("Failed to convert transactions:", error);
        // Fallback to original amounts
        const fallbackTransactions = transactions.map(t => ({
          ...t,
          displayAmount: t.amount
        }));
        setConvertedTransactions(fallbackTransactions);
      } finally {
        setIsConverting(false);
      }
    };

    convertAllTransactions();
  }, [transactions, displayCurrency]);

  // Initialize categoryIds for all views when form opens
  useEffect(() => {
    if (isDialogOpen && !editingTransaction) {
      const categoryIds: Record<string, string> = {};
      views.forEach(view => {
        const viewCats = categories.filter(c => c.viewId === view.id);
        if (viewCats.length > 0) {
          categoryIds[view.id] = viewCats[0].id;
        }
      });
      setFormData(prev => ({ ...prev, categoryIds }));
    }
  }, [isDialogOpen, views, categories]);

  // Reset selected category if categories change
  useEffect(() => {
    if (!formData.categoryId && viewCategories[0]) {
      setFormData((f) => ({ ...f, categoryId: viewCategories[0].id }));
    }
  }, [viewCategories]);

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

  // Helper functions for transaction display
  const extractTimeFromNote = (note?: string): string => {
    if (!note) return "";
    const timeMatch = note.match(/\d{2}:\d{2}:\d{2}/);
    return timeMatch ? timeMatch[0] : "";
  };

  const extractTerminal = (note?: string): string => {
    if (!note) return "";
    const posFsMatch = note.match(/POS-FS-\w+/i);
    if (posFsMatch) return posFsMatch[0];
    if (note.includes('VEND (MONEY)')) return 'VEND (MONEY)';
    if (note.includes('FINANCIAL VEND')) return 'FINANCIAL VEND';
    return "";
  };

  const getTransactionType = (note?: string): 'Meal Plan' | 'Flex' | 'Manual' => {
    if (!note) return 'Manual';
    if (note.includes('VEND (MONEY)')) return 'Flex';
    if (note.includes('POS-FS-') || note.includes('FINANCIAL VEND')) return 'Meal Plan';
    return 'Manual';
  };

  // CSV Export function - exports all visible transactions
  const handleExport = () => {
    // Get transactions that match the current date range filter for selected view
    const transactionsToExport = filteredTransactions;

    if (transactionsToExport.length === 0) {
      alert("No transactions to export.");
      return;
    }

    // Sort by date chronologically
    const sorted = [...transactionsToExport].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateA !== dateB) return dateA - dateB;
      return a.amount - b.amount;
    });

    // Create CSV content
    const headers = ["Transaction #", "Date", "Time", "Label", "Amount (CAD)", "Type", "Note"];
    const rows = sorted.map((tx, index) => {
      // Get category name for selected view
      const txCategoryId = tx.categoryIds?.[selectedViewId] || tx.categoryId;
      const category = categories.find(c => c.id === txCategoryId);
      const date = new Date(tx.date);
      const dateStr = date.toLocaleDateString();
      // Extract time from note if available, otherwise use empty string
      const timeMatch = tx.note?.match(/\d{2}:\d{2}:\d{2}/);
      const timeStr = timeMatch ? timeMatch[0] : "";
      
      return [
        index + 1,
        dateStr,
        timeStr,
        category?.name || "Other",
        tx.amount.toFixed(2),
        tx.type,
        (tx.note || "").replace(/"/g, '""') // Escape quotes
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${String(cell)}"`).join(","))
    ].join("\n");

    // Download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const viewName = views.find(v => v.id === selectedViewId)?.name || "all";
    a.download = `transactions-${viewName}-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Use categoryId from selectedViewId
    const categoryId = formData.categoryIds[selectedViewId] || formData.categoryId;

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      amount: parseFloat(formData.amount || "0"),
      date: formData.date,
      categoryId: categoryId,
      type: formData.type,
      note: formData.note || undefined,
    };

    setTransactions([newTransaction, ...transactions]);
    setIsDialogOpen(false);
    setFormData({
      amount: "",
      date: new Date().toISOString().split("T")[0],
      categoryId: viewCategories[0]?.id || "",
      categoryIds: {},
      type: "expense",
      note: "",
    });
    setCurrentPage(1);
  };

  const handleDelete = (transactionId: string) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      setTransactions(transactions.filter((t) => t.id !== transactionId));
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    
    // Initialize categoryIds for all views
    const categoryIds: Record<string, string> = {};
    views.forEach(view => {
      const viewCats = categories.filter(c => c.viewId === view.id);
      const txCat = categories.find(c => c.id === transaction.categoryId);
      if (txCat && viewCats.includes(txCat)) {
        categoryIds[view.id] = transaction.categoryId;
      } else if (viewCats.length > 0) {
        categoryIds[view.id] = viewCats[0].id;
      }
    });

    setFormData({
      amount: transaction.amount.toString(),
      date: transaction.date,
      categoryId: transaction.categoryId,
      categoryIds: categoryIds,
      type: transaction.type,
      note: transaction.note || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction) return;

    const categoryId = formData.categoryIds[selectedViewId] || formData.categoryId;

    const updatedTransaction: Transaction = {
      ...editingTransaction,
      amount: parseFloat(formData.amount || "0"),
      date: formData.date,
      categoryId: categoryId,
      type: formData.type,
      note: formData.note || undefined,
    };

    setTransactions(transactions.map(t => t.id === editingTransaction.id ? updatedTransaction : t));
    setIsEditDialogOpen(false);
    setEditingTransaction(null);
    setFormData({
      amount: "",
      date: new Date().toISOString().split("T")[0],
      categoryId: viewCategories[0]?.id || "",
      categoryIds: {},
      type: "expense",
      note: "",
    });
  };

  // Helper function to check if date is within range
  const isDateInRange = (dateStr: string, range: string): boolean => {
    // Parse date as local to avoid timezone issues
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (range) {
      case "day":
        return date >= today;
      case "week": {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return date >= weekAgo;
      }
      case "month": {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return date >= monthAgo;
      }
      case "year": {
        const yearAgo = new Date(today);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        return date >= yearAgo;
      }
      case "all":
      default:
        return true;
    }
  };

  const filteredTransactions = convertedTransactions
    .filter((transaction) => {
      // Get category ID for this view
      const txCategoryId = transaction.categoryIds?.[selectedViewId] || transaction.categoryId;
      
      // Filter by view - only show transactions for the selected view
      const cat = categories.find(c => c.id === txCategoryId);
      if (!cat || cat.viewId !== selectedViewId) return false;
      
      // Filter by date range
      if (!isDateInRange(transaction.date, dateRange)) return false;
      
      // Filter out PREPAYMENT (ADMIN) and ACCOUNT ADJUSTMENT
      const note = transaction.note || "";
      const shouldExclude = note.includes("PREPAYMENT (ADMIN)") || note.includes("ACCOUNT ADJUSTMENT");
      if (shouldExclude) return false;

      // Filter by search query (search in note and terminal)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const noteMatch = note.toLowerCase().includes(query);
        const terminalMatch = extractTerminal(note).toLowerCase().includes(query);
        if (!noteMatch && !terminalMatch) return false;
      }

      // Filter by label
      if (labelFilter !== "all" && txCategoryId !== labelFilter) return false;

      return true;
    })
    .sort((a, b) => {
      // Sort by date descending (newest first)
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateB !== dateA) return dateB - dateA;
      // If same date, sort by amount descending
      return b.amount - a.amount;
    });

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage));
  const start = (currentPage - 1) * itemsPerPage;
  const pageItems = filteredTransactions.slice(start, start + itemsPerPage);

  // If filters change, reset to page 1
  useEffect(() => {
    setCurrentPage(1);
  }, [dateRange, selectedViewId, transactions.length, searchQuery, labelFilter]);

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setLabelFilter("all");
    setTypeFilter("all");
    setDateRange("all");
  };

  const handlePrevPage = () => {
    setCurrentPage((p) => Math.max(1, p - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((p) => Math.min(totalPages, p + 1));
  };

  const getLabelName = (transaction: any) => {
    // Get category ID for the selected view
    const txCategoryId = transaction.categoryIds?.[selectedViewId] || transaction.categoryId;
    // Only look in categories for the selected view
    const category = viewCategories.find((cat) => cat.id === txCategoryId);
    return category ? category.name : "Other";
  };

  const getLabelColor = (transaction: any) => {
    // Get category ID for the selected view (same logic as getLabelName)
    const txCategoryId = transaction.categoryIds?.[selectedViewId] || transaction.categoryId;
    // Only look in categories for the selected view
    const category = viewCategories.find((cat) => cat.id === txCategoryId);
    return category ? category.color : "#95A5A6";
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* View Selection and Filters */}
      <Card className="p-3 sm:p-4 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="space-y-3 sm:space-y-4">
          {/* Top Row: View and Date Range */}
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <Label htmlFor="view-select" className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">View</Label>
                <Select value={selectedViewId} onValueChange={setSelectedViewId}>
                  <SelectTrigger id="view-select" className="w-full bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {views.map((view) => (
                      <SelectItem key={view.id} value={view.id}>
                        {view.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-0">
                <Label htmlFor="date-range" className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">Date Range</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger id="date-range" className="w-full bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Today</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last 30 Days</SelectItem>
                    <SelectItem value="year">Last Year</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={() => setIsExportDialogOpen(true)} variant="outline" className="w-full xs:w-auto text-xs sm:text-sm h-9 sm:h-10">
                  <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          {/* Second Row: Search and Additional Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Search */}
            <div className="col-span-1">
              <Label htmlFor="search" className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">Search</Label>
              <div className="relative">
                <Input
                  id="search"
                  type="text"
                  placeholder="Search by keyword"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600 h-9 sm:h-10 pr-10"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Label Filter */}
            <div className="col-span-1">
              <Label htmlFor="label-filter" className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">Label</Label>
              <Select value={labelFilter} onValueChange={setLabelFilter}>
                <SelectTrigger id="label-filter" className="w-full bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600 h-9 sm:h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Labels</SelectItem>
                  {viewCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            {(searchQuery || labelFilter !== "all" || dateRange !== "all") && (
              <div className="col-span-1 flex items-end">
                <Button onClick={handleClearFilters} variant="outline" size="sm" className="w-full h-9 sm:h-10 text-xs sm:text-sm">
                  <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-4 sm:p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Transaction History</h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Track all your expenses and income
              {displayCurrency !== "CAD" && (
                <span className="ml-2 text-blue-600 dark:text-blue-400">
                  (Converted from CAD)
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Currency Selector */}
            <div className="w-40">
              <Label htmlFor="display-currency">Display Currency</Label>
              <Select value={displayCurrency} onValueChange={handleDisplayCurrencyChange}>
                <SelectTrigger id="display-currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SUPPORTED_CURRENCIES).map(([code, name]) => (
                    <SelectItem key={code} value={code}>
                      {code} - {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Transaction
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Transaction</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger id="type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="expense">Expense</SelectItem>
                        <SelectItem value="income">Income</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="amount">Amount (CAD)</Label>
                    <Input
                      id="amount"
                      type="text"
                      inputMode="decimal"
                      value={formData.amount}
                      onChange={(e) => {
                        const cleanValue = e.target.value.replace(/[^0-9.]/g, "");
                        if ((cleanValue.match(/\./g) || []).length > 1) return;
                        setFormData({ ...formData, amount: cleanValue });
                      }}
                      placeholder="e.g., 5.50"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter amount in CAD (base currency)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label>Assign Label for Each View</Label>
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded mb-3">
                      <p className="text-xs text-yellow-800 dark:text-yellow-200">
                        ⚠️ <strong>Note:</strong> This manual transaction will not be reflected on your WatCard dashboard. You must assign a label for each view.
                      </p>
                    </div>
                    {views.map(view => {
                      const viewCats = categories.filter(cat => cat.viewId === view.id);
                      return (
                        <div key={view.id} className="mb-3">
                          <Label htmlFor={`label-${view.id}`} className="text-sm font-medium">
                            {view.name} <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={formData.categoryIds[view.id] || ""}
                            onValueChange={(value) => 
                              setFormData({ 
                                ...formData, 
                                categoryIds: { ...formData.categoryIds, [view.id]: value } 
                              })
                            }
                            required
                          >
                            <SelectTrigger id={`label-${view.id}`}>
                              <SelectValue placeholder="Select label" />
                            </SelectTrigger>
                            <SelectContent>
                              {viewCats.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      );
                    })}
                  </div>

                  <div>
                    <Label htmlFor="note">Note (Optional)</Label>
                    <Textarea
                      id="note"
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      placeholder="Add a note about this transaction..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">
                      Add Transaction
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* Edit Transaction Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Transaction</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="edit-type">Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger id="edit-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="expense">Expense</SelectItem>
                        <SelectItem value="income">Income</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="edit-amount">Amount (CAD)</Label>
                    <Input
                      id="edit-amount"
                      type="text"
                      inputMode="decimal"
                      value={formData.amount}
                      onChange={(e) => {
                        const cleanValue = e.target.value.replace(/[^0-9.]/g, "");
                        if ((cleanValue.match(/\./g) || []).length > 1) return;
                        setFormData({ ...formData, amount: cleanValue });
                      }}
                      placeholder="e.g., 5.50"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter amount in CAD (base currency)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="edit-date">Date</Label>
                    <Input
                      id="edit-date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label>Assign Label for Each View</Label>
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded mb-3">
                      <p className="text-xs text-yellow-800 dark:text-yellow-200">
                        ⚠️ <strong>Note:</strong> This manual transaction will not be reflected on your WatCard dashboard. You must assign a label for each view.
                      </p>
                    </div>
                    {views.map(view => {
                      const viewCats = categories.filter(cat => cat.viewId === view.id);
                      return (
                        <div key={view.id} className="mb-3">
                          <Label htmlFor={`edit-label-${view.id}`} className="text-sm font-medium">
                            {view.name} <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={formData.categoryIds[view.id] || ""}
                            onValueChange={(value) => 
                              setFormData({ 
                                ...formData, 
                                categoryIds: { ...formData.categoryIds, [view.id]: value } 
                              })
                            }
                            required
                          >
                            <SelectTrigger id={`edit-label-${view.id}`}>
                              <SelectValue placeholder="Select label" />
                            </SelectTrigger>
                            <SelectContent>
                              {viewCats.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      );
                    })}
                  </div>

                  <div>
                    <Label htmlFor="edit-note">Note (Optional)</Label>
                    <Textarea
                      id="edit-note"
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      placeholder="Add a note about this transaction..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">
                      Update Transaction
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Loading Indicator */}
        {isConverting && (
          <div className="flex items-center justify-center py-4 text-blue-600 dark:text-blue-400">
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Converting currencies...
          </div>
        )}

        {/* Transaction Count */}
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Showing {start + 1}-{Math.min(start + itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions
        </div>

        {/* Table */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">#</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Terminal</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="max-w-xs">Note</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {pageItems.length > 0 ? (
                pageItems.map((transaction, index) => {
                  const transactionNumber = start + index + 1;
                  const time = extractTimeFromNote(transaction.note);
                  const terminal = extractTerminal(transaction.note);
                  const txType = getTransactionType(transaction.note);

                  return (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-sm">{transactionNumber}</TableCell>

                      <TableCell>
                        {(() => {
                          // Fix timezone issue by treating date as local
                          const [year, month, day] = transaction.date.split('-');
                          const localDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                          return localDate.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          });
                        })()}
                      </TableCell>

                      <TableCell className="font-mono text-sm">
                        {time || "-"}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className={`${
                          transaction.type === "income"
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}>
                          {transaction.type === "income" ? "+" : "-"}
                          {getCurrencySymbol(displayCurrency)}
                          {(transaction.displayAmount || transaction.amount).toFixed(2)}
                          
                          {/* Show original amount if converted */}
                          {transaction.displayAmount && transaction.displayAmount !== transaction.amount && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              C${transaction.amount.toFixed(2)} CAD
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: getLabelColor(transaction) }}
                          />
                          {getLabelName(transaction)}
                        </div>
                      </TableCell>

                      <TableCell className="text-sm">
                        {terminal || "-"}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className="text-xs"
                        >
                          {txType}
                        </Badge>
                      </TableCell>

                      <TableCell className="max-w-xs truncate text-sm">
                        {transaction.note || "-"}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(transaction)}>
                            <Edit className="w-4 h-4 text-blue-500" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(transaction.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-gray-500 dark:text-gray-400">
                    {transactions.length === 0
                      ? "No transactions yet. Add your first transaction to get started!"
                      : "No transactions match the selected filters."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col items-center justify-center mt-6 gap-3 sm:gap-4">
          {/* Page Info */}
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </div>

          {/* Page Controls - Mobile Optimized */}
          <div className="flex flex-col xs:flex-row items-center gap-2 w-full sm:w-auto">
            {/* Previous & First */}
            <div className="flex items-center gap-2">
              <Button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm px-3 sm:px-4"
              >
                Previous
              </Button>
            </div>

            {/* Page Numbers - Scrollable on mobile */}
            <div className="flex items-center gap-1 overflow-x-auto max-w-full px-2 scrollbar-hide">
              {/* First page */}
              {currentPage > 3 && (
                <>
                  <Button
                    onClick={() => setCurrentPage(1)}
                    variant="outline"
                    size="sm"
                    className="w-8 sm:w-10 h-8 sm:h-9 text-xs sm:text-sm flex-shrink-0"
                  >
                    1
                  </Button>
                  {currentPage > 4 && (
                    <span className="px-1 sm:px-2 text-gray-500 dark:text-gray-400 text-xs">...</span>
                  )}
                </>
              )}

              {/* Pages around current */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  // Show pages within 2 of current page
                  return page >= currentPage - 2 && page <= currentPage + 2;
                })
                .map(page => (
                  <Button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    className={`w-8 sm:w-10 h-8 sm:h-9 text-xs sm:text-sm flex-shrink-0 ${
                      currentPage === page ? 'bg-blue-600 text-white hover:bg-blue-700' : ''
                    }`}
                  >
                    {page}
                  </Button>
                ))}

              {/* Last page */}
              {currentPage < totalPages - 2 && (
                <>
                  {currentPage < totalPages - 3 && (
                    <span className="px-1 sm:px-2 text-gray-500 dark:text-gray-400 text-xs">...</span>
                  )}
                  <Button
                    onClick={() => setCurrentPage(totalPages)}
                    variant="outline"
                    size="sm"
                    className="w-8 sm:w-10 h-8 sm:h-9 text-xs sm:text-sm flex-shrink-0"
                  >
                    {totalPages}
                  </Button>
                </>
              )}
            </div>

            {/* Next & Last */}
            <div className="flex items-center gap-2">
              <Button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm px-3 sm:px-4"
              >
                Next
              </Button>
              <Button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm whitespace-nowrap px-2 sm:px-3"
              >
                Last
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Export Dialog */}
      <ExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        transactions={transactions}
        categories={categories}
        selectedViewId={selectedViewId}
        dateRange={dateRange}
        currency={displayCurrency}
        viewName={views.find(v => v.id === selectedViewId)?.name || "Unknown"}
      />
    </div>
  );
}