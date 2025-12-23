import { Budget, Transaction, Category } from "../App";

/**
 * Calculate budget amount for a given date range
 * Handles both static and dynamic budgets
 */
export function calculateBudgetForRange(
  budget: Budget,
  range: 'day' | 'week' | 'month' | 'year',
  fundsData: { mealPlanBalance: number; flexDollarsBalance: number }
): number {
  if (budget.isDynamic && budget.endDate) {
    // Dynamic budget: recalculate based on current balance and remaining time
    const balance = budget.type === 'mealplan'
      ? fundsData.mealPlanBalance
      : fundsData.flexDollarsBalance;

    const daysRemaining = getDaysUntil(budget.endDate);
    
    if (daysRemaining <= 0) {
      // End date has passed
      return 0;
    }

    const dailyBudget = balance / Math.max(daysRemaining, 1);

    // Convert daily to selected range
    return convertBudget(dailyBudget, 'day', range);
  } else {
    // Static budget: convert from budget's period to selected range
    return convertBudget(budget.amount, budget.period, range);
  }
}

/**
 * Convert budget amount from one period to another
 */
function convertBudget(amount: number, fromPeriod: string, toPeriod: string): number {
  const dailyAmount = toDailyAmount(amount, fromPeriod);
  return fromDailyAmount(dailyAmount, toPeriod);
}

/**
 * Convert any period amount to daily amount
 */
function toDailyAmount(amount: number, period: string): number {
  switch (period) {
    case 'day': return amount;
    case 'week': return amount / 8;
    case 'month': return amount / 31;
    case 'year': return amount / 366;
    default: return amount;
  }
}

/**
 * Convert daily amount to specified period
 */
function fromDailyAmount(dailyAmount: number, period: string): number {
  switch (period) {
    case 'day': return dailyAmount;
    case 'week': return dailyAmount * 8;
    case 'month': return dailyAmount * 31;
    case 'year': return dailyAmount * 366;
    default: return dailyAmount;
  }
}

/**
 * Parse date string (YYYY-MM-DD) to Date object without timezone issues
 */
function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Get number of days until end date
 */
function getDaysUntil(endDate: string): number {
  const end = parseDateString(endDate);
  const now = new Date();
  // Reset time to midnight for accurate day calculation
  end.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diff = end.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Calculate spent amount in a date range for a specific budget
 */
export function calculateSpentInRange(
  transactions: Transaction[],
  budget: Budget,
  dateRange: 'day' | 'week' | 'month' | 'year' | 'all',
  viewId: string,
  categories: Category[]
): number {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Helper to check if date is in range
  const isDateInRange = (dateStr: string): boolean => {
    // Parse date as local to avoid timezone issues
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    switch (dateRange) {
      case "day":
        return date.getTime() === today.getTime();
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
    .filter(tx => {
      // Only count expenses
      if (tx.type !== 'expense') return false;

      // Filter by date range
      if (!isDateInRange(tx.date)) return false;

      // Filter by money type (meal plan vs flex)
      const note = tx.note || '';
      const isMealPlan = note.includes('POS-FS-') && !note.includes('VEND (MONEY)');
      const isFlex = note.includes('VEND (MONEY)');

      if (budget.type === 'mealplan' && !isMealPlan) return false;
      if (budget.type === 'flex' && !isFlex) return false;

      return true;
    })
    .reduce((sum, tx) => sum + tx.amount, 0);
}

/**
 * Get date range label for display
 */
export function getDateRangeLabel(range: 'day' | 'week' | 'month' | 'year' | 'all'): string {
  switch (range) {
    case 'day': return 'Today';
    case 'week': return 'This Week';
    case 'month': return 'This Month';
    case 'year': return 'This Year';
    case 'all': return 'All Time';
    default: return 'Unknown';
  }
}

