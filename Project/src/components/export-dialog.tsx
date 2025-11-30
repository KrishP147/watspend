import React, { useState, useEffect } from "react";
import { Transaction, Category } from "../App";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Download } from "lucide-react";
import { prepareTransactionsForExport, exportToCSV, generateFilename } from "../utils/exportCSV";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactions: Transaction[];
  categories: Category[];
  selectedViewId: string;
  dateRange: string;
  viewName: string;
  displayCurrency: string;
}

export function ExportDialog({
  open,
  onOpenChange,
  transactions,
  categories,
  selectedViewId,
  dateRange,
  viewName,
  displayCurrency
}: ExportDialogProps) {
  const [filterByView, setFilterByView] = useState(true);
  const [filterByRange, setFilterByRange] = useState(true);
  const [filteredCount, setFilteredCount] = useState(0);

  // Update filtered count when filters change
  useEffect(() => {
    const prepared = prepareTransactionsForExport(
      transactions,
      categories,
      selectedViewId,
      dateRange,
      filterByView,
      filterByRange
    );
    setFilteredCount(prepared.length);
  }, [transactions, categories, selectedViewId, dateRange, filterByView, filterByRange]);

  const handleExport = () => {
    const exportTransactions = prepareTransactionsForExport(
      transactions,
      categories,
      selectedViewId,
      dateRange,
      filterByView,
      filterByRange
    );

    const filename = generateFilename(
      viewName,
      dateRange,
      filterByView,
      filterByRange
    );

    exportToCSV(exportTransactions, filename, displayCurrency);
    onOpenChange(false);
  };

  const rangeLabels: Record<string, string> = {
    'day': 'Today',
    'week': 'Last 7 Days',
    'month': 'Last 30 Days',
    'year': 'Last Year',
    'all': 'All Time'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Transactions
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Filter Options */}
          <div className="space-y-3">
            <Label className="text-gray-900 dark:text-white font-medium">Filter Options</Label>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="filter-view"
                checked={filterByView}
                onCheckedChange={(checked: boolean) => setFilterByView(checked)}
              />
              <label
                htmlFor="filter-view"
                className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                Filter by current view: <span className="font-medium text-blue-600 dark:text-blue-400">{viewName}</span>
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="filter-range"
                checked={filterByRange}
                onCheckedChange={(checked: boolean) => setFilterByRange(checked)}
              />
              <label
                htmlFor="filter-range"
                className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                Filter by current range: <span className="font-medium text-blue-600 dark:text-blue-400">{rangeLabels[dateRange] || dateRange}</span>
              </label>
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              <span className="font-bold text-2xl">{filteredCount}</span> transaction{filteredCount !== 1 ? 's' : ''} will be exported
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Format: CSV (Compatible with Excel, Google Sheets)
            </p>
          </div>

          {/* Export Format Info */}
          <div className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              <span className="font-medium">Columns:</span> Transaction #, Date, Time, Amount, Label, Terminal, Type, Note
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button 
              onClick={handleExport} 
              className="flex-1"
              disabled={filteredCount === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
