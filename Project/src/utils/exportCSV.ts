import { Transaction, Category } from "../App";
import { formatCurrency } from "./currency";

export interface ExportTransaction {
  transactionNumber: number;
  date: string;
  time: string;
  amount: number;
  label: string;
  terminal: string;
  type: 'Meal Plan' | 'Flex' | 'Manual';
  note: string;
}

// Extract time from transaction note (format: HH:MM:SS)
function extractTimeFromNote(note?: string): string {
  if (!note) return "";
  const timeMatch = note.match(/\d{2}:\d{2}:\d{2}/);
  return timeMatch ? timeMatch[0] : "";
}

// Extract terminal/location from transaction note
function extractTerminal(note?: string): string {
  if (!note) return "";
  
  // Extract POS-FS-XXX pattern
  const posFsMatch = note.match(/POS-FS-\w+/i);
  if (posFsMatch) return posFsMatch[0];
  
  // Extract VEND (MONEY) pattern
  if (note.includes('VEND (MONEY)')) return 'VEND (MONEY)';
  
  // Extract FINANCIAL VEND
  if (note.includes('FINANCIAL VEND')) return 'FINANCIAL VEND';
  
  return "";
}

// Determine transaction type from note
function getTransactionType(note?: string): 'Meal Plan' | 'Flex' | 'Manual' {
  if (!note) return 'Manual';
  
  // Flex transactions have VEND (MONEY)
  if (note.includes('VEND (MONEY)')) return 'Flex';
  
  // Meal Plan transactions have POS-FS- or FINANCIAL VEND
  if (note.includes('POS-FS-') || note.includes('FINANCIAL VEND')) return 'Meal Plan';
  
  return 'Manual';
}

// Get label name for a transaction in a specific view
function getLabelNameForView(
  transaction: Transaction,
  selectedViewId: string,
  categories: Category[]
): string {
  const txCategoryId = transaction.categoryIds?.[selectedViewId] || transaction.categoryId;
  const category = categories.find(c => c.id === txCategoryId);
  return category?.name || "Other";
}

// Check if date is within range
function isDateInRange(dateStr: string, range: string): boolean {
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
}

// Prepare transactions for export with filtering
export function prepareTransactionsForExport(
  allTransactions: Transaction[],
  categories: Category[],
  selectedViewId: string,
  dateRange: string,
  filterByView: boolean,
  filterByRange: boolean
): ExportTransaction[] {
  let filtered = allTransactions;

  // Filter by view
  if (filterByView) {
    filtered = filtered.filter(tx => {
      const txCategoryId = tx.categoryIds?.[selectedViewId] || tx.categoryId;
      const category = categories.find(c => c.id === txCategoryId);
      return category?.viewId === selectedViewId;
    });
  }

  // Filter by date range
  if (filterByRange) {
    filtered = filtered.filter(tx => isDateInRange(tx.date, dateRange));
  }

  // Sort by date chronologically
  const sorted = [...filtered].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    if (dateA !== dateB) return dateA - dateB;
    return a.amount - b.amount;
  });

  // Map to export format
  return sorted.map((tx, index) => ({
    transactionNumber: index + 1,
    date: tx.date,
    time: extractTimeFromNote(tx.note),
    amount: tx.amount,
    label: getLabelNameForView(tx, selectedViewId, categories),
    terminal: extractTerminal(tx.note),
    type: getTransactionType(tx.note),
    note: tx.note || ""
  }));
}

// Generate filename for export
export function generateFilename(
  viewName: string,
  dateRange: string,
  includeView: boolean,
  includeRange: boolean
): string {
  const parts = ['WatSpend_Export'];

  if (includeView) parts.push(viewName.replace(/\s+/g, '_'));
  if (includeRange) {
    const rangeNames: Record<string, string> = {
      'day': 'Today',
      'week': 'Last7Days',
      'month': 'Last30Days',
      'year': 'LastYear',
      'all': 'AllTime'
    };
    parts.push(rangeNames[dateRange] || dateRange);
  }

  const timestamp = new Date().toISOString().split('T')[0];
  parts.push(timestamp);

  return parts.join('_') + '.csv';
}

// Escape CSV field (handle commas, quotes, newlines)
function escapeCSVField(field: string): string {
  if (!field) return '""';
  
  // If field contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  
  return `"${field}"`;
}

// Export transactions to CSV
export function exportToCSV(
  transactions: ExportTransaction[],
  filename: string,
  currency: string
): void {
  if (transactions.length === 0) {
    alert("No transactions to export");
    return;
  }

  // CSV Headers
  const headers = [
    'Transaction #',
    'Date',
    'Time',
    'Amount',
    'Label',
    'Terminal',
    'Type',
    'Note'
  ];

  // CSV Rows
  const rows = transactions.map(tx => [
    tx.transactionNumber.toString(),
    tx.date,
    tx.time,
    formatCurrency(tx.amount, currency),
    tx.label,
    tx.terminal,
    tx.type,
    tx.note
  ]);

  // Build CSV content
  const csvContent = [
    headers.map(escapeCSVField).join(','),
    ...rows.map(row => row.map(escapeCSVField).join(','))
  ].join('\n');

  // Trigger download
  downloadCSV(csvContent, filename);
}

// Download CSV file
function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
