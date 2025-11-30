import { useState } from "react";
import { useAppContext, Category, Transaction, View } from "../App";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { formatCurrency } from "../utils/currency";
import { Wallet, DollarSign, TrendingDown, Plus, Edit2, Trash2, Search, Download } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ExportDialog } from "./export-dialog";

interface SpendingItem {
  name: string;
  spent: number;
  color: string;
  transactionCount: number;
}

const PRESET_COLORS = [
  "#8B4513", "#FF6B6B", "#4ECDC4", "#45B7D1", "#95A5A6",
  "#F39C12", "#9B59B6", "#E74C3C", "#1ABC9C", "#3498DB",
  "#E67E22", "#16A085", "#D35400", "#C0392B", "#8E44AD",
  "#2980B9", "#27AE60", "#F1C40F", "#34495E", "#2C3E50",
  "#E91E63", "#9C27B0", "#673AB7", "#3F51B5", "#2196F3",
  "#00BCD4", "#009688", "#4CAF50", "#8BC34A", "#CDDC39",
];

export function DashboardOverview() {
  const {
    categories,
    setCategories,
    transactions,
    setTransactions,
    displayCurrency,
    fundsData,
    views,
    setViews,
    selectedViewId,
    setSelectedViewId,
  } = useAppContext();

  const [dateRange, setDateRange] = useState("all");
  const [isEditMode, setIsEditMode] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isLabelDialogOpen, setIsLabelDialogOpen] = useState(false);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [editingLabel, setEditingLabel] = useState<Category | null>(null);
  const [transactionSearchQuery, setTransactionSearchQuery] = useState("");
  const [viewFormData, setViewFormData] = useState({ name: "" });
  const [labelFormData, setLabelFormData] = useState({ name: "", color: PRESET_COLORS[0] });
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<string[]>([]);

  // Filter categories by selected view
  const viewCategories: Category[] = categories.filter((cat: Category) => cat.viewId === selectedViewId);
  const selectedView: View | undefined = views.find((v: View) => v.id === selectedViewId);

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

  // Filter transactions by date range
  const filteredTransactions = transactions.filter((tx: Transaction) => 
    isDateInRange(tx.date, dateRange)
  );

  // Calculate spending by label (no budget comparison)
  const getSpendingByCategory = (): SpendingItem[] => {
    return viewCategories.map((cat: Category) => {
      // Sum all expenses for this category within date range
      const categoryTransactions = filteredTransactions.filter((tx: Transaction) => {
        if (tx.type !== "expense") return false;
        // Check categoryIds map first, then legacy categoryId
        const txCategoryId = tx.categoryIds?.[selectedViewId] || tx.categoryId;
        return txCategoryId === cat.id;
      });
      
      const totalSpent = categoryTransactions.reduce((sum: number, tx: Transaction) => sum + tx.amount, 0);
      
      return {
        name: cat.name,
        spent: totalSpent,
        color: cat.color,
        transactionCount: categoryTransactions.length,
      };
    }).filter((item: SpendingItem) => item.spent > 0) // Only show labels with spending
      .sort((a: SpendingItem, b: SpendingItem) => b.spent - a.spent); // Sort by amount descending
  };

  const spendingData = getSpendingByCategory();
  const totalSpent = spendingData.reduce((sum: number, item: SpendingItem) => sum + item.spent, 0);
  const transactionCount = filteredTransactions.filter((t: Transaction) => t.type === "expense").length;
  const totalBalance = fundsData.mealPlanBalance + fundsData.flexDollarsBalance;

  // Calculate meal plan and flex spending separately
  const mealPlanSpent = filteredTransactions
    .filter((t: Transaction) => {
      if (t.type !== "expense") return false;
      const note = t.note || "";
      // Meal Plan transactions have POS-FS- or FINANCIAL VEND but NOT VEND (MONEY)
      return (note.includes("POS-FS-") || note.includes("FINANCIAL VEND")) && !note.includes("VEND (MONEY)");
    })
    .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

  const flexSpent = filteredTransactions
    .filter((t: Transaction) => {
      if (t.type !== "expense") return false;
      const note = t.note || "";
      // Flex transactions have VEND (MONEY)
      return note.includes("VEND (MONEY)");
    })
    .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

  // Handler functions for label management
  const handleOpenTransactionDialog = () => {
    if (editingLabel) {
      setSelectedTransactionIds(
        transactions.filter((t: Transaction) => {
          const txCategoryId = t.categoryIds?.[selectedViewId] || t.categoryId;
          return txCategoryId === editingLabel.id;
        }).map((t: Transaction) => t.id)
      );
    } else {
      setSelectedTransactionIds([]);
    }
    setIsTransactionDialogOpen(true);
  };

  const handleSelectAllTransactions = () => {
    setSelectedTransactionIds(availableTransactions.map((t: Transaction) => t.id));
  };

  const handleDeselectAllTransactions = () => {
    setSelectedTransactionIds([]);
  };

  const handleLabelSubmit = (e: any) => {
    e.preventDefault();

    // Prevent renaming "Other" label - it must always be called "Other"
    if (editingLabel && editingLabel.name === "Other" && labelFormData.name.trim() !== "Other") {
      alert("The 'Other' label cannot be renamed. It must always be called 'Other' as it is a required catch-all label.");
      return;
    }

    // Prevent creating a new label with the name "Other" if one already exists
    if (!editingLabel && labelFormData.name.trim().toLowerCase() === "other") {
      const existingOther = viewCategories.find((c: Category) => c.name === "Other");
      if (existingOther) {
        alert("An 'Other' label already exists in this view. There can only be one 'Other' label per view.");
        return;
      }
    }

    // Check for duplicate label names (case-insensitive) in the same view
    const labelNameLower = labelFormData.name.trim().toLowerCase();
    const duplicateLabel = viewCategories.find((c: Category) => 
      c.name.toLowerCase() === labelNameLower && 
      (!editingLabel || c.id !== editingLabel.id)
    );

    if (duplicateLabel) {
      alert(`A label with the name "${labelFormData.name}" already exists in this view. Please choose a different name.`);
      return;
    }

    if (editingLabel) {
      const updatedLabel = {
        ...editingLabel,
        name: labelFormData.name.trim(),
        color: labelFormData.color,
      };

      const otherLabel = viewCategories.find((c: Category) => c.name === "Other" && c.id !== updatedLabel.id);
      const updatedTransactions = transactions.map((tx: Transaction) => {
        const txCategoryId = tx.categoryIds?.[selectedViewId] || tx.categoryId;
        if (txCategoryId === editingLabel.id) {
          const categoryIds = { ...tx.categoryIds };
          if (selectedTransactionIds.includes(tx.id)) {
            categoryIds[selectedViewId] = updatedLabel.id;
            return { ...tx, categoryIds, categoryId: updatedLabel.id };
          } else if (otherLabel) {
            categoryIds[selectedViewId] = otherLabel.id;
            return { ...tx, categoryIds, categoryId: otherLabel.id };
          }
        }
        return tx;
      });

      setCategories(categories.map((cat: Category) => cat.id === editingLabel.id ? updatedLabel : cat));
      setTransactions(updatedTransactions);
    } else {
      const newLabel: Category = {
        id: Date.now().toString(),
        name: labelFormData.name.trim(),
        monthlyGoal: 0,
        color: labelFormData.color,
        labelIds: [],
        viewId: selectedViewId,
      };

      const updatedTransactions = transactions.map((tx: Transaction) => {
        if (selectedTransactionIds.includes(tx.id)) {
          const categoryIds = { ...tx.categoryIds };
          categoryIds[selectedViewId] = newLabel.id;
          return { ...tx, categoryIds, categoryId: newLabel.id };
        }
        return tx;
      });

      setCategories([...categories, newLabel]);
      setTransactions(updatedTransactions);
    }

    setIsLabelDialogOpen(false);
    setEditingLabel(null);
    setSelectedTransactionIds([]);
    setLabelFormData({ name: "", color: PRESET_COLORS[0] });
  };

  const handleEditLabel = (labelName: string) => {
    const label = viewCategories.find((c: Category) => c.name === labelName);
    if (!label) return;

    setEditingLabel(label);
    setLabelFormData({ name: label.name, color: label.color });
    setSelectedTransactionIds(
      transactions.filter((t: Transaction) => {
        const txCategoryId = t.categoryIds?.[selectedViewId] || t.categoryId;
        return txCategoryId === label.id;
      }).map((t: Transaction) => t.id)
    );
    setIsLabelDialogOpen(true);
  };

  const handleDeleteLabel = (labelName: string) => {
    const label = viewCategories.find((c: Category) => c.name === labelName);
    if (!label) return;

    // Prevent deletion of "Other" label - it's a required catch-all
    if (label.name === "Other") {
      alert("The 'Other' label cannot be deleted. It is required as a catch-all for all transactions.");
      return;
    }

    if (confirm("Are you sure you want to delete this label?")) {
      const otherLabel = viewCategories.find((c: Category) => c.name === "Other" && c.id !== label.id);
      if (otherLabel) {
        const updatedTransactions = transactions.map((tx: Transaction) => {
          const txCategoryId = tx.categoryIds?.[selectedViewId] || tx.categoryId;
          if (txCategoryId === label.id) {
            const categoryIds = { ...tx.categoryIds };
            categoryIds[selectedViewId] = otherLabel.id;
            return { ...tx, categoryIds, categoryId: otherLabel.id };
          }
          return tx;
        });
        setTransactions(updatedTransactions);
      }
      setCategories(categories.filter((cat: Category) => cat.id !== label.id));
    }
  };

  const handleViewSubmit = (e: any) => {
    e.preventDefault();
    if (!viewFormData.name.trim()) return;

    if (views.find((v: View) => v.name.toLowerCase() === viewFormData.name.toLowerCase())) {
      alert("A view with this name already exists!");
      return;
    }

    const newView: View = {
      id: `view-${Date.now()}`,
      name: viewFormData.name,
      type: 'custom',
      categoryIds: []
    };

    const otherLabel: Category = {
      id: `other-${newView.id}-${Date.now()}`,
      name: "Other",
      monthlyGoal: 0,
      color: "#95A5A6",
      labelIds: [],
      viewId: newView.id
    };

    // Add "Other" label to the view's categoryIds
    newView.categoryIds = [otherLabel.id];

    // Ensure all transactions have a label for this new view (assign to "Other")
    const updatedTransactions = transactions.map((tx: Transaction) => {
      const categoryIds = tx.categoryIds || {};
      // Always assign to "Other" for the new view if not already assigned
      if (!categoryIds[newView.id]) {
        categoryIds[newView.id] = otherLabel.id;
      }
      return { ...tx, categoryIds, categoryId: tx.categoryId || otherLabel.id };
    });

    setViews([...views, newView]);
    setCategories([...categories, otherLabel]);
    setTransactions(updatedTransactions);
    setViewFormData({ name: "" });
    setIsViewDialogOpen(false);
  };

  const availableTransactions = transactions.filter((t: Transaction) => {
    if (!transactionSearchQuery) return true;
    const note = (t.note || '').toLowerCase();
    return note.includes(transactionSearchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* All 4 Cards in 1 Row - Enhanced Design */}
      <div className="grid gap-6 grid-cols-4">
        {/* Spending Breakdown Card - Deep Purple Theme */}
        <Card className="text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-center overflow-hidden rounded-xl" style={{ background: 'linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%)' }}>
          <CardHeader className="pb-4 pt-6 px-6 flex flex-col items-center justify-center">
            <CardTitle className="text-lg font-bold text-white mb-5 text-center tracking-tight">
              Spending Breakdown
            </CardTitle>
            <div className="space-y-3 w-full">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="text-white bg-white/20 hover:bg-white/30 border-white/30 text-sm h-9 transition-all backdrop-blur-sm">
                  <SelectValue placeholder="Range" className="text-white" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedViewId} onValueChange={setSelectedViewId}>
                <SelectTrigger className="text-white bg-white/20 hover:bg-white/30 border-white/30 text-sm h-9 transition-all backdrop-blur-sm">
                  <SelectValue placeholder="View" className="text-white" />
                </SelectTrigger>
                <SelectContent>
                  {views.map((view: View) => (
                    <SelectItem key={view.id} value={view.id}>
                      {view.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
        </Card>

        {/* Meal Plan Balance - Green Theme */}
        <Card className="text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-center items-center overflow-hidden rounded-xl" style={{ background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)' }}>
          <CardHeader className="pb-0 pt-6 px-6 flex flex-col items-center justify-center">
            <CardTitle className="text-lg font-bold flex items-center justify-center gap-2 text-white mb-2 tracking-tight">
              <Wallet className="w-5 h-5" />
              Meal Plan Left
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 pb-6 px-6 text-center flex flex-col items-center justify-center">
            <p className="text-8xl font-black text-white leading-none drop-shadow-lg">
              {formatCurrency(fundsData.mealPlanBalance, displayCurrency)}
            </p>
          </CardContent>
        </Card>

        {/* Flex Dollars Balance - Blue Theme */}
        <Card className="text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-center items-center overflow-hidden rounded-xl" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)' }}>
          <CardHeader className="pb-0 pt-6 px-6 flex flex-col items-center justify-center">
            <CardTitle className="text-lg font-bold flex items-center justify-center gap-2 text-white mb-2 tracking-tight">
              <DollarSign className="w-5 h-5" />
              Flex Left
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 pb-6 px-6 text-center flex flex-col items-center justify-center">
            <p className="text-8xl font-black text-white leading-none drop-shadow-lg">
              {formatCurrency(fundsData.flexDollarsBalance, displayCurrency)}
            </p>
          </CardContent>
        </Card>

        {/* Total Spent - Orange Theme */}
        <Card className="text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-center items-center overflow-hidden rounded-xl" style={{ background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)' }}>
          <CardHeader className="pb-0 pt-6 px-6 flex flex-col items-center justify-center">
            <CardTitle className="text-lg font-bold flex items-center justify-center gap-2 text-white mb-2 tracking-tight">
              <TrendingDown className="w-5 h-5" />
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 pb-6 px-6 text-center flex flex-col items-center justify-center">
            <p className="text-8xl font-black text-white leading-none drop-shadow-lg">
              {formatCurrency(totalSpent, displayCurrency)}
            </p>
            <p className="text-sm text-white/90 mt-3 font-semibold">
              {transactionCount} transaction{transactionCount !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
      </div>


      {/* Spending List - Full Height */}
      <Card className="flex-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Spending by Label</CardTitle>
            <div className="flex items-center gap-2">
              <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => setViewFormData({ name: "" })}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create View
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <DialogHeader>
                    <DialogTitle>Create New View</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleViewSubmit} className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="view-name">View Name</Label>
                      <Input
                        id="view-name"
                        value={viewFormData.name}
                        onChange={(e) => setViewFormData({ name: e.target.value })}
                        placeholder="e.g., By Building"
                        required
                        className="bg-white dark:bg-gray-700"
                        style={{ color: 'black' }}
                      />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button type="submit" className="flex-1">Create View</Button>
                      <Button type="button" variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={isLabelDialogOpen} onOpenChange={setIsLabelDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={() => {
                    setEditingLabel(null);
                    setSelectedTransactionIds([]);
                    setLabelFormData({ name: "", color: PRESET_COLORS[0] });
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Label
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                  <DialogHeader className="flex-shrink-0">
                    <DialogTitle>{editingLabel ? "Edit Label" : "Add New Label"}</DialogTitle>
                  </DialogHeader>

                  <form onSubmit={handleLabelSubmit} className="space-y-4 mt-4 flex-1 flex flex-col overflow-hidden">
                    <div className="flex-shrink-0 space-y-4 overflow-y-auto pr-2">
                      <div>
                        <Label htmlFor="name">Label Name</Label>
                        <Input
                          id="name"
                          value={labelFormData.name}
                          onChange={(e) => setLabelFormData({ ...labelFormData, name: e.target.value })}
                          placeholder="e.g., Coffee"
                          required
                          className="bg-white dark:bg-gray-700"
                        style={{ color: 'black' }}
                        />
                      </div>

                      <div>
                        <Label>Label Color</Label>
                        <div className="flex items-center gap-3">
                          <Input
                            type="color"
                            value={labelFormData.color}
                            onChange={(e) => setLabelFormData({ ...labelFormData, color: e.target.value })}
                            className="w-16 h-10 p-0 border-0 rounded"
                          />
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {PRESET_COLORS.map((color) => (
                              <button
                                key={color}
                                type="button"
                                className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                                style={{ backgroundColor: color }}
                                onClick={() => setLabelFormData({ ...labelFormData, color })}
                                title={color}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label>Assign Transactions</Label>
                        <p className="text-xs text-gray-500 mb-2">
                          Select which transactions belong to this label.
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleOpenTransactionDialog}
                          className="w-full"
                        >
                          <Search className="w-4 h-4 mr-2" />
                          Select Transactions ({selectedTransactionIds.length} selected)
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4 flex-shrink-0 border-t mt-4">
                      <Button type="submit" className="flex-1">
                        {editingLabel ? "Update" : "Add"} Label
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setIsLabelDialogOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <Button
                variant={isEditMode ? "default" : "outline"}
                size="sm"
                onClick={() => setIsEditMode(!isEditMode)}
              >
                <Edit2 className="w-4 h-4 mr-2" />
                {isEditMode ? "Done" : "Edit"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {spendingData.length > 0 ? (
            <div className="space-y-3 min-h-[600px] max-h-[700px] overflow-y-auto">
              {spendingData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-5 h-5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <div>
                      <p className="font-medium text-base">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.transactionCount} transaction{item.transactionCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-xl font-semibold">
                      {formatCurrency(item.spent, displayCurrency)}
                    </p>
                    {isEditMode && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditLabel(item.name)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        {item.name !== "Other" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteLabel(item.name)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No transactions for this view yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Transaction Selection Dialog */}
      <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0 pb-2">
            <DialogTitle className="text-gray-900 dark:text-white">Select Transactions for Label</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col space-y-3 flex-1 min-h-0">
            <div className="flex-shrink-0 flex gap-2">
              <Input
                placeholder="Search transactions..."
                value={transactionSearchQuery}
                onChange={(e) => setTransactionSearchQuery(e.target.value)}
                className="flex-1 !text-black dark:!text-black !bg-white dark:!bg-white placeholder:text-gray-500"
              />
              <Button type="button" variant="outline" onClick={handleSelectAllTransactions}>
                Select All
              </Button>
              <Button type="button" variant="outline" onClick={handleDeselectAllTransactions}>
                Deselect All
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded p-4 min-h-0" style={{maxHeight: '50vh'}}>
              {availableTransactions.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No transactions available</p>
              ) : (
                <div className="space-y-2">
                  {availableTransactions.map((tx) => {
                    const isSelected = selectedTransactionIds.includes(tx.id);
                    const currentLabel = viewCategories.find((c: Category) => {
                      const txCategoryId = tx.categoryIds?.[selectedViewId] || tx.categoryId;
                      return c.id === txCategoryId;
                    });
                    return (
                      <div
                        key={tx.id}
                        className={`p-3 rounded border cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700"
                            : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                        onClick={() => {
                          setSelectedTransactionIds(prev =>
                            prev.includes(tx.id)
                              ? prev.filter(id => id !== tx.id)
                              : [...prev, tx.id]
                          );
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatCurrency(tx.amount, displayCurrency)} • {tx.date}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{tx.note || "No note"}</p>
                            {currentLabel && (
                              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                Currently in: {currentLabel.name}
                              </p>
                            )}
                          </div>
                          <div className="ml-4">
                            {isSelected ? (
                              <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            ) : (
                              <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="flex-shrink-0 flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {selectedTransactionIds.length} transaction{selectedTransactionIds.length !== 1 ? 's' : ''} selected
              </p>
              <Button type="button" onClick={() => setIsTransactionDialogOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <ExportDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        transactions={transactions}
        categories={categories}
        selectedViewId={selectedViewId}
        dateRange={dateRange}
        viewName={selectedView?.name || "Current View"}
        displayCurrency={displayCurrency}
      />
    </div>
  );
}
