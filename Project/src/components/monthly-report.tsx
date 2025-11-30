import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from "react";
import { useAppContext, Budget, LabelAllocation } from "../App";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { BudgetCreator } from "./budget-creator";
import { Plus, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { calculateBudgetForRange, calculateSpentInRange, getDateRangeLabel } from "../utils/budgetCalculations";
import { formatCurrency } from "../utils/currency";
import { Download } from "lucide-react";
import { ExportDialog } from "./export-dialog";
import { Progress } from "./ui/progress";

// Error Boundary to catch rendering errors
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class MonthlyReportErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("MonthlyReport Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <h3 className="text-red-600 dark:text-red-400 font-semibold mb-2">Something went wrong</h3>
          <p className="text-red-500 dark:text-red-300 text-sm mb-4">{this.state.error?.message}</p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function MonthlyReportContent() {
  console.log("MonthlyReport component rendering");

  const {
    categories,
    transactions,
    settings,
    displayCurrency,
    views,
    selectedViewId,
    setSelectedViewId,
    budgets,
    setBudgets,
    selectedBudgetId,
    setSelectedBudgetId,
    fundsData
  } = useAppContext();

  // ALL useState hooks MUST be before any early returns!
  const [selectedRange, setSelectedRange] = useState<'day' | 'week' | 'month' | 'year' | 'all'>('month');
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [editingLabelAmount, setEditingLabelAmount] = useState<string>('');

  console.log("Context loaded:", { 
    categories: categories?.length,
    views: views?.length,
    budgets: budgets?.length,
    fundsData
  });

  // Safety check - render loading state if essential data is missing
  // NOTE: This must be AFTER all hooks!
  if (!categories || !views || !transactions || !budgets) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const getCurrencySymbol = (currency: string) => {
    const symbols: { [key: string]: string } = {
      USD: "$", CAD: "C$", EUR: "€", GBP: "£", JPY: "¥", AUD: "A$", CNY: "¥", RWF: "RF",
    };
    return symbols[currency] || "$";
  };

  const format = (value: number) => formatCurrency(value, displayCurrency);

  // Handle budget creation/editing
  const handleSaveBudget = (budget: Budget) => {
    if (editingBudget) {
      setBudgets(budgets.map(b => b.id === editingBudget.id ? budget : b));
    } else {
      setBudgets([...budgets, budget]);
    }
    setIsBudgetDialogOpen(false);
    setEditingBudget(null);
  };

  const handleCancelBudget = () => {
    setIsBudgetDialogOpen(false);
    setEditingBudget(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Goals & Budget</h2>
        <Dialog open={isBudgetDialogOpen} onOpenChange={setIsBudgetDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingBudget(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Budget
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-2xl h-[70vh] flex flex-col overflow-hidden mx-3 bg-white dark:bg-gray-900">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="text-gray-900 dark:text-white">{editingBudget ? "Edit Budget" : "Create New Budget"}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
              <BudgetCreator
                editingBudget={editingBudget}
                onSave={handleSaveBudget}
                onCancel={handleCancelBudget}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Header with dropdowns */}
      <Card className="p-3 sm:p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
          <div className="flex-1 min-w-0">
            <Label className="text-gray-900 dark:text-white text-xs sm:text-sm">Budget</Label>
            <div className="mt-1.5">
            <Select value={selectedBudgetId || "none"} onValueChange={(v) => setSelectedBudgetId(v === "none" ? null : v)}>
              <SelectTrigger className="bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600 h-9 sm:h-10">
                <SelectValue placeholder="Select budget" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No budget</SelectItem>
                {budgets.map(b => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name} ({b.type === 'mealplan' ? 'Meal Plan' : 'Flex'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <Label className="text-gray-900 dark:text-white text-xs sm:text-sm">Time Range</Label>
            <div className="mt-1.5">
            <Select value={selectedRange} onValueChange={(v: any) => setSelectedRange(v)}>
              <SelectTrigger className="bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600 h-9 sm:h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          </div>

          <div className="flex-1 min-w-0">
            <Label className="text-gray-900 dark:text-white text-xs sm:text-sm">View</Label>
            <div className="mt-1.5">
            <Select value={selectedViewId} onValueChange={setSelectedViewId}>
              <SelectTrigger className="bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600 h-9 sm:h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {views.map(v => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* Budget Management */}
      <Card className="p-4 sm:p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Budgets</h3>
        </div>

        <div className="space-y-4">
          {budgets.map(budget => {
            const budgetForRange = calculateBudgetForRange(budget, selectedRange === 'all' ? 'month' : selectedRange, fundsData);
            const rangeLabel = selectedRange === 'day' ? 'today' : 
                              selectedRange === 'week' ? 'this week' : 
                              selectedRange === 'month' ? 'this month' : 
                              selectedRange === 'year' ? 'this year' : 'per month';
            
            // Parse date string to avoid timezone issues (YYYY-MM-DD format)
            const formatEndDate = (dateStr: string) => {
              const [year, month, day] = dateStr.split('-').map(Number);
              return new Date(year, month - 1, day).toLocaleDateString();
            };
            
            return (
            <div key={budget.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/70 hover:shadow-md transition-all duration-200 flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">{budget.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {format(budgetForRange)} {rangeLabel} • {budget.type === 'mealplan' ? 'Meal Plan' : 'Flex'}
                  {budget.isDynamic && " • Dynamic"}
                  {budget.endDate && ` • Ends ${formatEndDate(budget.endDate)}`}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingBudget(budget);
                    setIsBudgetDialogOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (confirm("Delete this budget?")) {
                      setBudgets(budgets.filter(b => b.id !== budget.id));
                      if (selectedBudgetId === budget.id) {
                        setSelectedBudgetId(null);
                      }
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          );})}
          {budgets.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No budgets yet. Create your first budget to start tracking!
            </p>
          )}
        </div>
      </Card>

      {/* Label Performance */}
      <Card className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Label Performance</h3>
          {selectedBudgetId && (() => {
            const selectedBudget = budgets.find(b => b.id === selectedBudgetId);
            if (!selectedBudget) return null;
            
            const budgetForRange = calculateBudgetForRange(selectedBudget, selectedRange === 'all' ? 'month' : selectedRange, fundsData);
            const currentAllocations = selectedBudget.labelAllocations?.[selectedViewId] || [];
            
            const getAllocatedForRange = (allocation: { amount: number }): number => {
              const dailyAmount = allocation.amount / (
                selectedBudget.period === 'day' ? 1 :
                selectedBudget.period === 'week' ? 8 :
                selectedBudget.period === 'month' ? 31 : 366
              );
              const rangeMultiplier = selectedRange === 'day' ? 1 :
                selectedRange === 'week' ? 8 :
                selectedRange === 'month' ? 31 :
                selectedRange === 'year' ? 366 : 31;
              return dailyAmount * rangeMultiplier;
            };
            
            const totalAllocated = currentAllocations.reduce((sum, a) => sum + getAllocatedForRange(a), 0);
            let remaining = Math.max(0, budgetForRange - totalAllocated);
            
            // If the daily equivalent is less than 1 cent, treat as 0
            const rangeDivisor = selectedRange === 'day' ? 1 :
              selectedRange === 'week' ? 7 :
              selectedRange === 'month' ? 31 :
              selectedRange === 'year' ? 365 : 31;
            if (remaining / rangeDivisor < 0.01) {
              remaining = 0;
            }
            
            return (
              <p className={`text-sm font-medium ${remaining <= 0 ? 'text-red-500' : 'text-green-600'}`}>
                {remaining <= 0 ? `${format(0)} left to allocate` : `${format(remaining)} left to allocate`}
              </p>
            );
          })()}
        </div>
        
        {/* Budget type note */}
        {selectedBudgetId && (() => {
          const selectedBudget = budgets.find(b => b.id === selectedBudgetId);
          if (!selectedBudget) return null;
          const budgetType = selectedBudget.type === 'mealplan' ? 'Meal Plan' : 'Flex';
          const oppositeType = selectedBudget.type === 'mealplan' ? 'Flex' : 'Meal Plan';
          return (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Note:</strong> This budget is only for <strong>{budgetType}</strong>. Make sure not to mix up labels with {oppositeType} transactions with this budget!
              </p>
            </div>
          );
        })()}
        
        <div className="space-y-4">
          {categories.filter(c => c.viewId === selectedViewId).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.filter(c => c.viewId === selectedViewId).map(cat => {
                // Get budget info if a budget is selected
                const selectedBudget = selectedBudgetId ? budgets.find(b => b.id === selectedBudgetId) : null;
                const currentView = views.find(v => v.id === selectedViewId);
                const isMealPlanFlexView = currentView?.type === 'mealplan-flex';
                
                // Check if this label is available for the selected budget
                const isCategoryAvailable = (): boolean => {
                  if (!selectedBudget) return true; // No budget selected, all available
                  const catName = cat.name.toUpperCase();
                  const isFlexCategory = catName.includes('VEND (MONEY)') || catName.includes('FINANCIAL VEND') || catName === 'FLEX';
                  const isMealPlanCategory = catName.includes('POS-FS') || catName === 'MEAL PLAN';

                  if (isMealPlanFlexView) {
                    if (selectedBudget.type === 'mealplan') return catName === 'MEAL PLAN';
                    else return catName === 'FLEX';
                  } else {
                    if (selectedBudget.type === 'mealplan') return !isFlexCategory || isMealPlanCategory;
                    else return isFlexCategory;
                  }
                };
                
                const isAvailable = isCategoryAvailable();
                
                // Helper function to filter by range
                const isDateInRange = (dateStr: string): boolean => {
                  const [year, month, day] = dateStr.split('-').map(Number);
                  const date = new Date(year, month - 1, day);
                  const now = new Date();
                  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                  
                  switch (selectedRange) {
                    case "day": return date >= today;
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
                    default: return true;
                  }
                };

                const spent = transactions
                  .filter((t) => {
                    const txCategoryId = t.categoryIds?.[selectedViewId] || t.categoryId;
                    return txCategoryId === cat.id && t.type === "expense" && isDateInRange(t.date);
                  })
                  .reduce((sum, t) => sum + t.amount, 0);

                const transactionCount = transactions.filter((t) => {
                  const txCategoryId = t.categoryIds?.[selectedViewId] || t.categoryId;
                  return txCategoryId === cat.id && t.type === "expense" && isDateInRange(t.date);
                }).length;

                // Budget allocation helpers
                const getAllocatedForRange = (): number => {
                  if (!selectedBudget) return 0;
                  const allocation = selectedBudget.labelAllocations?.[selectedViewId]?.find(a => a.categoryId === cat.id);
                  if (!allocation) return 0;
                  const dailyAmount = allocation.amount / (
                    selectedBudget.period === 'day' ? 1 :
                    selectedBudget.period === 'week' ? 8 :
                    selectedBudget.period === 'month' ? 31 : 366
                  );
                  const rangeMultiplier = selectedRange === 'day' ? 1 :
                    selectedRange === 'week' ? 8 :
                    selectedRange === 'month' ? 31 :
                    selectedRange === 'year' ? 366 : 31;
                  return dailyAmount * rangeMultiplier;
                };

                const allocatedForRange = getAllocatedForRange();
                const progress = allocatedForRange > 0 ? Math.min(100, (spent / allocatedForRange) * 100) : 0;
                const isOverBudget = spent > allocatedForRange && allocatedForRange > 0;

                // Calculate max amount this label can have (total budget minus other allocations)
                const getMaxAllowedForLabel = (): number => {
                  if (!selectedBudget) return 0;
                  const budgetForRange = calculateBudgetForRange(selectedBudget, selectedRange === 'all' ? 'month' : selectedRange, fundsData);
                  const allAllocations = selectedBudget.labelAllocations?.[selectedViewId] || [];
                  const rangeMultiplier = selectedRange === 'day' ? 1 :
                    selectedRange === 'week' ? 8 :
                    selectedRange === 'month' ? 31 :
                    selectedRange === 'year' ? 366 : 31;
                  
                  // Sum of all OTHER allocations (not this label)
                  const otherAllocationsTotal = allAllocations
                    .filter(a => a.categoryId !== cat.id)
                    .reduce((sum, a) => {
                      const dailyAmount = a.amount / (
                        selectedBudget.period === 'day' ? 1 :
                        selectedBudget.period === 'week' ? 8 :
                        selectedBudget.period === 'month' ? 31 : 366
                      );
                      return sum + (dailyAmount * rangeMultiplier);
                    }, 0);
                  
                  return Math.max(0, budgetForRange - otherAllocationsTotal);
                };

                const maxAllowedForLabel = getMaxAllowedForLabel();

                // Update allocation handler
                const handleUpdateAllocation = (newAmount: number) => {
                  if (!selectedBudget) return;
                  
                  // Cap the amount to max allowed
                  const cappedAmount = Math.min(newAmount, maxAllowedForLabel);
                  
                  const rangeMultiplier = selectedRange === 'day' ? 1 :
                    selectedRange === 'week' ? 8 :
                    selectedRange === 'month' ? 31 :
                    selectedRange === 'year' ? 366 : 31;
                  const dailyAmount = cappedAmount / rangeMultiplier;
                  const periodAmount = dailyAmount * (
                    selectedBudget.period === 'day' ? 1 :
                    selectedBudget.period === 'week' ? 8 :
                    selectedBudget.period === 'month' ? 31 : 366
                  );

                  const existingAllocations = selectedBudget.labelAllocations?.[selectedViewId] || [];
                  const existingIndex = existingAllocations.findIndex(a => a.categoryId === cat.id);
                  
                  let newAllocations: LabelAllocation[];
                  if (cappedAmount <= 0) {
                    newAllocations = existingAllocations.filter(a => a.categoryId !== cat.id);
                  } else if (existingIndex >= 0) {
                    newAllocations = existingAllocations.map((a, i) => 
                      i === existingIndex ? { ...a, amount: Math.round(periodAmount * 100) / 100 } : a
                    );
                  } else {
                    newAllocations = [...existingAllocations, { categoryId: cat.id, amount: Math.round(periodAmount * 100) / 100 }];
                  }

                  const updatedBudget = {
                    ...selectedBudget,
                    labelAllocations: {
                      ...selectedBudget.labelAllocations,
                      [selectedViewId]: newAllocations
                    }
                  };
                  setBudgets(budgets.map(b => b.id === selectedBudget.id ? updatedBudget : b));
                };

                const isEditing = editingLabelId === cat.id;

                return (
                  <div
                    key={cat.id}
                    className={`p-4 border rounded-xl transition-all duration-200 ${
                      selectedBudgetId && !isAvailable
                        ? 'border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 opacity-50'
                        : 'border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/70 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: isAvailable || !selectedBudgetId ? cat.color : '#9CA3AF' }}
                        />
                        <h4 className={`font-medium text-sm sm:text-base truncate ${isAvailable || !selectedBudgetId ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                          {cat.name}
                        </h4>
                      </div>
                      {selectedBudgetId && isAvailable && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs"
                          onClick={() => {
                            if (isEditing) {
                              setEditingLabelId(null);
                              setEditingLabelAmount('');
                            } else {
                              setEditingLabelId(cat.id);
                              setEditingLabelAmount(allocatedForRange > 0 ? allocatedForRange.toFixed(2) : '');
                            }
                          }}
                        >
                          {isEditing ? 'Cancel' : 'Edit Budget'}
                        </Button>
                      )}
                    </div>
                    
                    {selectedBudgetId && !isAvailable && (
                      <p className="text-xs text-gray-400 mb-2">
                        ({selectedBudget?.type === 'mealplan' ? 'Flex only' : 'Meal Plan only'})
                      </p>
                    )}
                    
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {format(spent)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {transactionCount} transaction{transactionCount !== 1 ? 's' : ''} • {selectedRange === 'all' ? 'All time' : `This ${selectedRange}`}
                    </p>

                    {/* Edit budget input */}
                    {isEditing && (
                      <div className="mt-3">
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max={maxAllowedForLabel}
                            value={editingLabelAmount}
                            onChange={(e) => setEditingLabelAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-28 h-8 text-sm bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            className="h-8"
                            onClick={() => {
                              handleUpdateAllocation(parseFloat(editingLabelAmount) || 0);
                              setEditingLabelId(null);
                              setEditingLabelAmount('');
                            }}
                          >
                            Save
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Max: {format(maxAllowedForLabel)}
                        </p>
                      </div>
                    )}

                    {/* Budget progress bar */}
                    {selectedBudgetId && isAvailable && allocatedForRange > 0 && !isEditing && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className={isOverBudget ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}>
                            {format(spent)} / {format(allocatedForRange)} budget
                          </span>
                          <span className={isOverBudget ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}>
                            {progress.toFixed(0)}%
                          </span>
                        </div>
                        <Progress 
                          value={Math.min(progress, 100)} 
                          className={`h-2 ${isOverBudget ? '[&>div]:bg-red-500' : ''}`}
                        />
                        {isOverBudget && (
                          <p className="text-xs text-red-500 mt-1">
                            Over by {format(spent - allocatedForRange)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No labels for this view. Create labels in the Dashboard.
            </p>
          )}
        </div>
      </Card>

      {/* Budget Performance Graph */}
      {selectedBudgetId && (
        <Card className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Budget Performance</CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Comparing actual spending to allocated budget for {views.find(v => v.id === selectedViewId)?.name || 'current view'}
            </p>
          </CardHeader>
          <CardContent>
            {(() => {
              const selectedBudget = budgets.find(b => b.id === selectedBudgetId);
              if (!selectedBudget) return null;

              const currentView = views.find(v => v.id === selectedViewId);
              const isMealPlanFlexView = currentView?.type === 'mealplan-flex';

              // Helper: Check if a category is available for this budget type
              const isCategoryAvailableForBudget = (cat: { name: string }): boolean => {
                const catName = cat.name.toUpperCase();
                const isFlexCategory = catName.includes('VEND (MONEY)') || catName.includes('FINANCIAL VEND') || catName === 'FLEX';
                const isMealPlanCategory = catName.includes('POS-FS') || catName === 'MEAL PLAN';

                if (isMealPlanFlexView) {
                  if (selectedBudget.type === 'mealplan') {
                    return catName === 'MEAL PLAN';
                  } else {
                    return catName === 'FLEX';
                  }
                } else {
                  if (selectedBudget.type === 'mealplan') {
                    return !isFlexCategory || isMealPlanCategory;
                  } else {
                    return isFlexCategory;
                  }
                }
              };

              // Get allocations for this view
              const currentAllocations = selectedBudget.labelAllocations?.[selectedViewId] || [];

              // Helper to get allocated amount for range
              const getAllocatedForRange = (allocation: { amount: number }): number => {
                const dailyAmount = allocation.amount / (
                  selectedBudget.period === 'day' ? 1 :
                  selectedBudget.period === 'week' ? 8 :
                  selectedBudget.period === 'month' ? 31 :
                  366
                );
                const rangeMultiplier = 
                  selectedRange === 'day' ? 1 :
                  selectedRange === 'week' ? 8 :
                  selectedRange === 'month' ? 31 :
                  selectedRange === 'year' ? 366 : 31;
                return dailyAmount * rangeMultiplier;
              };

              // Helper: Get spent for category in range
              const getSpentForCategory = (categoryId: string): number => {
                const isDateInRange = (dateStr: string): boolean => {
                  const [year, month, day] = dateStr.split('-').map(Number);
                  const date = new Date(year, month - 1, day);
                  const now = new Date();
                  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                  
                  switch (selectedRange) {
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

                return transactions
                  .filter(t => {
                    const txCategoryId = t.categoryIds?.[selectedViewId] || t.categoryId;
                    return txCategoryId === categoryId && t.type === "expense" && isDateInRange(t.date);
                  })
                  .reduce((sum, t) => sum + t.amount, 0);
              };

              // Get categories for the selected view - only available ones
              const viewCategories = categories.filter(c => c.viewId === selectedViewId && isCategoryAvailableForBudget(c));

              // Calculate budget and spent for each available category
              const budgetPerformanceData = viewCategories.map(cat => {
                const allocation = currentAllocations.find(a => a.categoryId === cat.id);
                const budgetForCat = allocation ? getAllocatedForRange(allocation) : 0;
                const spentForCat = getSpentForCategory(cat.id);

                return {
                  label: cat.name,
                  budget: Math.round(budgetForCat * 100) / 100,
                  spent: Math.round(spentForCat * 100) / 100,
                };
              });

              if (budgetPerformanceData.length === 0) {
                return (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                    No available labels for this budget type in this view.
                  </p>
                );
              }

              return (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={budgetPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => `$${value.toFixed(2)}`}
                    />
                    <Legend />
                    <Bar dataKey="budget" fill="#8884d8" name="Allocated Budget" />
                    <Bar dataKey="spent" fill="#82ca9d" name="Actual Spent" />
                  </BarChart>
                </ResponsiveContainer>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Period Comparison Graph */}
      <Card className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Compare Periods</CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Compare spending across different {selectedRange === 'day' ? 'days' : selectedRange === 'week' ? 'weeks' : selectedRange === 'month' ? 'months' : 'years'}
          </p>
        </CardHeader>
        <CardContent>
          {(() => {
            // Generate comparison data for the last several periods
            const now = new Date();
            const comparisonData: { period: string; spent: number }[] = [];
            
            // Determine how many periods to show
            const periodCount = selectedRange === 'day' ? 7 : selectedRange === 'week' ? 5 : selectedRange === 'month' ? 6 : 5;
            
            for (let i = periodCount - 1; i >= 0; i--) {
              let periodDate = new Date(now);
              let periodLabel = '';
              
              switch (selectedRange) {
                case 'day':
                  // Show last 7 days
                  periodDate.setDate(now.getDate() - i);
                  periodLabel = periodDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  break;
                case 'week':
                  // Show last 5 weeks, labeled as "Week of [Monday date]"
                  periodDate.setDate(now.getDate() - (i * 7));
                  // Get the Monday of that week
                  const dayOfWeek = periodDate.getDay();
                  const daysToMonday = (dayOfWeek === 0 ? 6 : dayOfWeek - 1); // Sunday is 0
                  const monday = new Date(periodDate);
                  monday.setDate(periodDate.getDate() - daysToMonday);
                  periodLabel = `Week of ${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
                  break;
                case 'month':
                  // Show last 6 months
                  periodDate.setMonth(now.getMonth() - i);
                  periodLabel = periodDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                  break;
                case 'year':
                  periodDate.setFullYear(now.getFullYear() - i);
                  periodLabel = periodDate.getFullYear().toString();
                  break;
                default:
                  continue;
              }
              
              // Calculate spent for this period
              const spent = transactions
                .filter(t => {
                  // Fix timezone issue for transaction dates
                  const [year, month, day] = t.date.split('-').map(Number);
                  const txDate = new Date(year, month - 1, day);
                  const txViewCategoryId = t.categoryIds?.[selectedViewId] || t.categoryId;
                  const isInView = categories.some(c => c.id === txViewCategoryId && c.viewId === selectedViewId);
                  
                  switch (selectedRange) {
                    case 'day': {
                      const checkDate = new Date(periodDate);
                      return txDate.toDateString() === checkDate.toDateString() && isInView && t.type === 'expense';
                    }
                    case 'week': {
                      // Get Monday of the period's week
                      const dayOfWeek = periodDate.getDay();
                      const daysToMonday = (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
                      const weekStart = new Date(periodDate);
                      weekStart.setDate(periodDate.getDate() - daysToMonday);
                      weekStart.setHours(0, 0, 0, 0);
                      const weekEnd = new Date(weekStart);
                      weekEnd.setDate(weekEnd.getDate() + 7);
                      return txDate >= weekStart && txDate < weekEnd && isInView && t.type === 'expense';
                    }
                    case 'month': {
                      return txDate.getMonth() === periodDate.getMonth() && 
                             txDate.getFullYear() === periodDate.getFullYear() && 
                             isInView && t.type === 'expense';
                    }
                    case 'year': {
                      return txDate.getFullYear() === periodDate.getFullYear() && 
                             isInView && t.type === 'expense';
                    }
                    default:
                      return false;
                  }
                })
                .reduce((sum, t) => sum + t.amount, 0);
              
              // Round to 2 decimal places
              comparisonData.push({ period: periodLabel, spent: Math.round(spent * 100) / 100 });
            }
            
            if (selectedRange === 'all') {
              return (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                  Period comparison is not available for "All Time" range. Please select a specific time range.
                </p>
              );
            }
            
            return (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="period" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '0.5rem' }}
                    labelStyle={{ color: '#F9FAFB' }}
                    itemStyle={{ color: '#F9FAFB' }}
                    formatter={(value: number) => `$${value.toFixed(2)}`}
                    labelFormatter={(label) => label}
                  />
                  <Legend wrapperStyle={{ color: '#F9FAFB' }} />
                  <Bar dataKey="spent" fill="#3B82F6" name="" />
                </BarChart>
              </ResponsiveContainer>
            );
          })()}
        </CardContent>
      </Card>

      {/* Trophy Shelf */}
      <Card className="p-6 bg-gradient-to-br from-purple-600 to-blue-600">
        <h3 className="text-lg font-semibold text-white mb-4">🏆 Trophy Cabinet</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white/20 backdrop-blur rounded-lg">
            <div className="text-4xl mb-2">🏆</div>
            <p className="text-sm font-medium text-white">Budget Master</p>
            <p className="text-xs text-white/90">Stay under budget 5 times</p>
          </div>
          <div className="text-center p-4 bg-white/10 backdrop-blur rounded-lg opacity-50">
            <div className="text-4xl mb-2">🎯</div>
            <p className="text-sm font-medium text-white">Goal Achiever</p>
            <p className="text-xs text-white/90">Locked</p>
          </div>
          <div className="text-center p-4 bg-white/10 backdrop-blur rounded-lg opacity-50">
            <div className="text-4xl mb-2">💰</div>
            <p className="text-sm font-medium text-white">Savings Star</p>
            <p className="text-xs text-white/90">Locked</p>
          </div>
          <div className="text-center p-4 bg-white/10 backdrop-blur rounded-lg opacity-50">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-sm font-medium text-white">Tracking Pro</p>
            <p className="text-xs text-white/90">Locked</p>
          </div>
        </div>
      </Card>


      {/* Export Dialog */}
      <ExportDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        transactions={transactions}
        categories={categories}
        selectedViewId={selectedViewId}
        dateRange={selectedRange}
        viewName={views.find(v => v.id === selectedViewId)?.name || "Current View"}
        displayCurrency={displayCurrency}
      />
    </div>
  );
}

// Export the wrapped component
export function MonthlyReport() {
  return (
    <MonthlyReportErrorBoundary>
      <MonthlyReportContent />
    </MonthlyReportErrorBoundary>
  );
}