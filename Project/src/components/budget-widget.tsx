import React from "react";
import { useAppContext, Budget } from "../App";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";
import { calculateBudgetForRange, calculateSpentInRange, getDateRangeLabel } from "../utils/budgetCalculations";
// Currency formatting helper
const getCurrencySymbol = (currency: string) => {
  const symbols: { [key: string]: string } = {
    USD: "$", CAD: "C$", EUR: "€", GBP: "£", JPY: "¥", AUD: "A$", CNY: "¥", RWF: "RF",
  };
  return symbols[currency] || "$";
};

interface BudgetWidgetProps {
  dateRange: string; // 'day' | 'week' | 'month' | 'year' | 'all'
}

export function BudgetWidget({ dateRange }: BudgetWidgetProps) {
  const {
    budgets,
    selectedBudgetId,
    setSelectedBudgetId,
    transactions,
    categories,
    fundsData,
    displayCurrency,
    selectedViewId,
  } = useAppContext();

  const selectedBudget = budgets.find(b => b.id === selectedBudgetId);

  const formatCurrency = (value: number) => {
    const symbol = getCurrencySymbol(displayCurrency);
    return `${symbol}${value.toFixed(2)}`;
  };

  // Calculate budget and spent for current range
  const budgetForRange = selectedBudget
    ? calculateBudgetForRange(selectedBudget, dateRange === 'all' ? 'month' : dateRange as 'day' | 'week' | 'month' | 'year', fundsData)
    : 0;

  const spentInRange = selectedBudget
    ? calculateSpentInRange(transactions, selectedBudget, dateRange as 'day' | 'week' | 'month' | 'year' | 'all', selectedViewId, categories)
    : 0;

  const remaining = budgetForRange - spentInRange;
  const percentage = budgetForRange > 0 ? (spentInRange / budgetForRange) * 100 : 0;
  const isOverBudget = remaining < 0;

  if (!selectedBudget) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No budget selected. Create a budget in the Goals & Budget page.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Budget Status</CardTitle>
          <div className="flex items-center gap-2">
            <Label htmlFor="budget-select" className="text-sm">Active Budget:</Label>
            <Select
              value={selectedBudgetId || "none"}
              onValueChange={(value) => setSelectedBudgetId(value === "none" ? null : value)}
            >
              <SelectTrigger id="budget-select" className="w-[200px] bg-white dark:bg-white border-gray-300 dark:border-gray-300 text-black dark:text-black hover:bg-white dark:hover:bg-white" style={{ color: 'black' }}>
                <SelectValue style={{ color: 'black' }} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Budget</SelectItem>
                {budgets.map(budget => (
                  <SelectItem key={budget.id} value={budget.id}>
                    {budget.name} ({budget.type === 'mealplan' ? 'Meal Plan' : 'Flex'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      {selectedBudget ? (
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Budget ({selectedBudget.period})
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(budgetForRange)}
                </p>
                {selectedBudget.isDynamic && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Dynamic • Updates daily
                  </p>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Spent ({getDateRangeLabel(dateRange)})
                </p>
                <p className={`text-2xl font-bold ${isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                  {formatCurrency(spentInRange)}
                </p>
                {isOverBudget && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    Over budget by {formatCurrency(Math.abs(remaining))}
                  </p>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Progress</span>
                <span className={`text-sm font-medium ${isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>
                  {percentage.toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={Math.min(percentage, 100)} 
                className={`h-3 ${isOverBudget ? 'bg-red-100 dark:bg-red-900/20' : ''}`}
              />
            </div>

            <div>
              <p className={`text-sm font-medium ${isOverBudget ? 'text-red-600 dark:text-red-400' : remaining > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>
                {isOverBudget 
                  ? `Over budget by ${formatCurrency(Math.abs(remaining))}`
                  : `Remaining: ${formatCurrency(remaining)}`
                }
              </p>
              {selectedBudget.endDate && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Ends: {(() => {
                    const [year, month, day] = selectedBudget.endDate.split('-').map(Number);
                    return new Date(year, month - 1, day).toLocaleDateString();
                  })()}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      ) : (
        <CardContent>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            Select a budget to track your spending
          </p>
        </CardContent>
      )}
    </Card>
  );
}

