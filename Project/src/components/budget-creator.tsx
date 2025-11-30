import React, { useState, useEffect } from "react";
import { useAppContext, Budget } from "../App";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label as UILabel } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card } from "./ui/card";
import { formatCurrency as formatCurrencyUtil } from "../utils/currency";

// Simple date formatter for input field (YYYY-MM-DD format)
const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
};

// Simple date formatter for display
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

interface BudgetCreatorProps {
  editingBudget?: Budget | null;
  onSave: (budget: Budget) => void;
  onCancel: () => void;
}

export function BudgetCreator({ editingBudget, onSave, onCancel }: BudgetCreatorProps) {
  const { fundsData, displayCurrency } = useAppContext();
  
  const [formData, setFormData] = useState({
    name: editingBudget?.name || "",
    type: (editingBudget?.type || "mealplan") as "mealplan" | "flex",
    amount: editingBudget?.amount.toString() || "",
    period: (editingBudget?.period || "month") as "day" | "week" | "month" | "year",
    endDate: editingBudget?.endDate || "",
    isDynamic: editingBudget?.isDynamic || false,
  });

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    formData.endDate ? (() => {
      const [year, month, day] = formData.endDate.split('-').map(Number);
      return new Date(year, month - 1, day, 12, 0, 0);
    })() : undefined
  );
  const [dailyAverage, setDailyAverage] = useState<number | null>(null);

  // Update selectedDate when editingBudget changes
  useEffect(() => {
    if (editingBudget?.endDate) {
      const [year, month, day] = editingBudget.endDate.split('-').map(Number);
      const date = new Date(year, month - 1, day, 12, 0, 0);
      setSelectedDate(date);
    } else if (!editingBudget) {
      setSelectedDate(undefined);
    }
  }, [editingBudget]);


  // Calculate daily average when end date changes
  useEffect(() => {
    if (selectedDate && fundsData) {
      const now = new Date();
      const end = new Date(selectedDate);
      end.setHours(23, 59, 59, 999);
      
      const daysRemaining = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysRemaining > 0) {
        const balance = formData.type === 'mealplan'
          ? fundsData.mealPlanBalance
          : fundsData.flexDollarsBalance;
        
        if (balance > 0) {
          setDailyAverage(balance / daysRemaining);
        } else {
          setDailyAverage(null);
        }
      } else {
        setDailyAverage(null);
      }
    } else {
      setDailyAverage(null);
    }
  }, [selectedDate, formData.type, fundsData]);

  const handleUseAverage = () => {
    if (dailyAverage !== null) {
      setFormData({
        ...formData,
        amount: dailyAverage.toFixed(2),
        period: "day",
        isDynamic: true,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert("Please enter a valid budget amount");
      return;
    }

    if (formData.isDynamic && !formData.endDate) {
      alert("Please select an end date for dynamic budgets");
      return;
    }

    const budget: Budget = {
      id: editingBudget?.id || Date.now().toString(),
      name: formData.name,
      type: formData.type,
      amount: parseFloat(formData.amount),
      period: formData.period,
      endDate: formData.endDate || undefined,
      isDynamic: formData.isDynamic,
      createdAt: editingBudget?.createdAt || Date.now(),
    };

    onSave(budget);
  };

  // Use the formatCurrency utility which handles currency conversion
  const formatCurrency = (value: number) => {
    return formatCurrencyUtil(value, displayCurrency);
  };

  const currentBalance = formData.type === 'mealplan'
    ? fundsData.mealPlanBalance
    : fundsData.flexDollarsBalance;

  const daysRemaining = selectedDate
    ? Math.ceil((selectedDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
      {/* Basic Info */}
      <div>
        <UILabel htmlFor="budget-name" className="text-gray-900 dark:text-white">Budget Name</UILabel>
        <Input
          id="budget-name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., January Meal Plan"
          required
          className="mt-1 bg-white dark:bg-gray-700"
          style={{ color: 'black' }}
        />
      </div>

      <div>
        <UILabel className="text-gray-900 dark:text-white">Money Type</UILabel>
        <div className="flex gap-4 mt-2">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="type-mealplan"
              name="money-type"
              value="mealplan"
              checked={formData.type === "mealplan"}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as "mealplan" | "flex" })}
              className="w-4 h-4"
            />
            <UILabel htmlFor="type-mealplan" className="cursor-pointer text-gray-900 dark:text-white">Meal Plan</UILabel>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="type-flex"
              name="money-type"
              value="flex"
              checked={formData.type === "flex"}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as "mealplan" | "flex" })}
              className="w-4 h-4"
            />
            <UILabel htmlFor="type-flex" className="cursor-pointer text-gray-900 dark:text-white">Flex Dollars</UILabel>
          </div>
        </div>
      </div>

      {/* Budget Type */}
      <div>
        <UILabel className="text-gray-900 dark:text-white">Budget Type</UILabel>
        <Tabs
          value={formData.isDynamic ? "dynamic" : "static"}
          onValueChange={(value) => setFormData({ ...formData, isDynamic: value === "dynamic" })}
          className="mt-2"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="static" className="text-gray-900 dark:text-white">Static Amount</TabsTrigger>
            <TabsTrigger value="dynamic" className="text-gray-900 dark:text-white">Dynamic (Auto-calculate)</TabsTrigger>
          </TabsList>

          <TabsContent value="static" className="space-y-3 mt-2">
            <div>
              <UILabel htmlFor="static-amount" className="text-gray-900 dark:text-white">Amount</UILabel>
              <Input
                id="static-amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="e.g., 500"
                required
                className="mt-2 bg-white dark:bg-gray-700"
                style={{ color: 'black' }}
              />
            </div>

            <div>
              <UILabel htmlFor="static-period" className="text-gray-900 dark:text-white">Period</UILabel>
              <Select
                value={formData.period}
                onValueChange={(value: any) => setFormData({ ...formData, period: value })}
              >
                <SelectTrigger id="static-period" className="mt-2 bg-white dark:bg-white border-gray-300 dark:border-gray-300 hover:bg-white dark:hover:bg-white" style={{ color: 'black' }}>
                  <SelectValue style={{ color: 'black' }} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Per Day</SelectItem>
                  <SelectItem value="week">Per Week</SelectItem>
                  <SelectItem value="month">Per Month</SelectItem>
                  <SelectItem value="year">Per Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="dynamic" className="space-y-3 mt-2">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 rounded-lg mb-2">
              <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1 text-sm">
                💡 Dynamic Budget
              </p>
              <p className="text-xs text-blue-800 dark:text-blue-200">
                This budget calculates how much you need to spend <strong>each day</strong> to use <strong>all your remaining {formData.type === 'mealplan' ? 'meal plan' : 'flex'} money</strong> by the selected end date.
              </p>
            </div>
            
            <div>
              <UILabel className="text-gray-900 dark:text-white">End Date</UILabel>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Select the date by which you want to spend all your {formData.type === 'mealplan' ? 'meal plan' : 'flex'} money
              </p>
              <div className="mt-2">
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => {
                    const dateStr = e.target.value;
                    if (dateStr) {
                      // Parse date parts to avoid timezone issues
                      const [year, month, day] = dateStr.split('-').map(Number);
                      const date = new Date(year, month - 1, day, 12, 0, 0); // noon local time
                      setSelectedDate(date);
                      setFormData({ ...formData, endDate: dateStr });
                    } else {
                      setSelectedDate(undefined);
                      setFormData({ ...formData, endDate: "" });
                    }
                  }}
                  min={formatDateForInput(new Date())}
                  className="bg-white dark:bg-white border-gray-300"
                  style={{ color: 'black' }}
                />
              </div>
            </div>

            {selectedDate && dailyAverage !== null && daysRemaining > 0 && (
              <Card className="p-3 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <p className="font-semibold text-green-900 dark:text-green-100 mb-1 text-sm">Daily Spending Target:</p>
                <p className="text-xs text-green-800 dark:text-green-200">
                  Balance: <strong>{formatCurrency(currentBalance)}</strong> · {daysRemaining} days remaining
                </p>
                <p className="text-lg font-bold mt-2 text-green-900 dark:text-green-100 border-t border-green-200 dark:border-green-700 pt-2">
                  {formatCurrency(dailyAverage)} per day
                </p>
                <Button
                  type="button"
                  onClick={handleUseAverage}
                  className="mt-2 w-full"
                  variant="default"
                  size="sm"
                >
                  Use This Amount
                </Button>
              </Card>
            )}

            {selectedDate && daysRemaining <= 0 && (
              <Card className="p-2 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                <p className="text-xs text-red-800 dark:text-red-200">
                  ⚠️ End date has passed. Please select a future date.
                </p>
              </Card>
            )}

            {selectedDate && currentBalance <= 0 && (
              <Card className="p-2 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  ⚠️ No balance available. Budget unavailable.
                </p>
              </Card>
            )}

            {formData.isDynamic && formData.amount && (
              <div>
                <UILabel htmlFor="dynamic-amount" className="text-gray-900 dark:text-white">Daily Budget Amount</UILabel>
                <Input
                  id="dynamic-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="Auto-calculated or enter manually"
                  required
                  className="mt-2 bg-white dark:bg-gray-700"
                  style={{ color: 'black' }}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  This will be recalculated daily based on remaining balance
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" className="flex-1">
          {editingBudget ? "Update" : "Create"} Budget
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

