import { useState } from "react";
import { useAppContext, Category, Transaction, View } from "../App";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { formatCurrency } from "../utils/currency";
import { Wallet, DollarSign, TrendingDown, Plus, Edit2, Trash2, Search, Download, X } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ExportDialog } from "./export-dialog";

// Shake animation keyframes
const shakeAnimationStyle = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }
  .shake-animation {
    animation: shake 0.5s ease-in-out;
  }
`;

interface SpendingItem {
  name: string;
  spent: number;
  color: string;
  transactionCount: number;
}

const PRESET_COLORS = [
  "#E74C3C", // Red
  "#F39C12", // Orange
  "#F1C40F", // Yellow
  "#1ABC9C", // Teal
  "#3498DB", // Blue
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
  const [cardTransforms, setCardTransforms] = useState<{ [key: string]: { rotateX: number; rotateY: number; scale: number } }>({});
  const [showLabelShake, setShowLabelShake] = useState(false);
  const [isFieldDropdownOpen, setIsFieldDropdownOpen] = useState(false);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

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
    }).sort((a: SpendingItem, b: SpendingItem) => b.spent - a.spent); // Sort by amount descending (show all labels, even empty ones)
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
        const isCurrentlyInThisLabel = txCategoryId === editingLabel.id;
        const isSelected = selectedTransactionIds.includes(tx.id);
        
        // Case 1: Transaction is selected - assign it to this label
        if (isSelected) {
          const categoryIds = { ...tx.categoryIds };
          categoryIds[selectedViewId] = updatedLabel.id;
          return { ...tx, categoryIds, categoryId: updatedLabel.id };
        }
        
        // Case 2: Transaction was in this label but is now deselected - move to Other
        if (isCurrentlyInThisLabel && !isSelected && otherLabel) {
          const categoryIds = { ...tx.categoryIds };
          categoryIds[selectedViewId] = otherLabel.id;
          return { ...tx, categoryIds, categoryId: otherLabel.id };
        }
        
        return tx;
      });

      setCategories(categories.map((cat: Category) => cat.id === editingLabel.id ? updatedLabel : cat));
      setTransactions(updatedTransactions);
      console.log(`✏️ Updated label "${updatedLabel.name}" with ${selectedTransactionIds.length} transactions`);
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
      console.log(`➕ Created new label "${newLabel.name}" with ${selectedTransactionIds.length} transactions`);
      
      // Trigger shake animation on label button
      setShowLabelShake(true);
      setTimeout(() => setShowLabelShake(false), 1000);
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
    
    // Auto-switch to the newly created view and trigger shake animation
    setSelectedViewId(newView.id);
    setShowLabelShake(true);
    setTimeout(() => setShowLabelShake(false), 1000);
  };

  const handleDeleteView = (viewId: string) => {
    // Prevent deletion if it's the only view
    if (views.length <= 1) {
      alert("You must have at least one view. Create another view before deleting this one.");
      return;
    }

    if (confirm("Are you sure you want to delete this view? All associated labels and transactions will be affected.")) {
      // Delete the view
      const updatedViews = views.filter((v: View) => v.id !== viewId);
      setViews(updatedViews);
      
      // Delete all categories associated with this view
      const updatedCategories = categories.filter((cat: Category) => cat.viewId !== viewId);
      setCategories(updatedCategories);
      
      // If the deleted view was selected, switch to the first available view
      if (selectedViewId === viewId) {
        setSelectedViewId(updatedViews[0].id);
      }
    }
  };

  const availableTransactions = transactions.filter((t: Transaction) => {
    if (!transactionSearchQuery) return true;
    const note = (t.note || '').toLowerCase();
    return note.includes(transactionSearchQuery.toLowerCase());
  });

  // Handle mouse movement for 3D card effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, cardId: string) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 25;
    const rotateY = (centerX - x) / 25;
    const scale = 1.03;
    
    setCardTransforms(prev => ({
      ...prev,
      [cardId]: { rotateX, rotateY, scale }
    }));
  };

  const handleMouseLeave = (cardId: string) => {
    setCardTransforms(prev => ({
      ...prev,
      [cardId]: { rotateX: 0, rotateY: 0, scale: 1 }
    }));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* All 3 Cards - Responsive Grid */}
      <div className="flex flex-row gap-3 sm:gap-4 lg:gap-6 flex-wrap" style={{ perspective: '1000px' }}>
        {/* Meal Plan Balance - Green Theme */}
        <Card 
          className="flex-1 text-white border-0 shadow-lg hover:shadow-xl flex flex-col justify-center items-center overflow-hidden rounded-xl" 
          style={{ 
            background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
            transform: `perspective(1000px) rotateX(${cardTransforms.mealPlan?.rotateX || 0}deg) rotateY(${cardTransforms.mealPlan?.rotateY || 0}deg) scale(${cardTransforms.mealPlan?.scale || 1})`,
            transformStyle: 'preserve-3d',
            transition: 'transform 0.1s ease-out'
          }}
          onMouseMove={(e) => handleMouseMove(e, 'mealPlan')}
          onMouseLeave={() => handleMouseLeave('mealPlan')}
        >
          <CardHeader className="pb-0 pt-4 sm:pt-6 px-4 sm:px-6 flex flex-col items-center justify-center">
            <CardTitle className="text-sm sm:text-base lg:text-lg font-bold flex items-center justify-center gap-1.5 sm:gap-2 text-white mb-1 sm:mb-2 tracking-tight">
              <Wallet className="w-10 h-10 sm:w-5 sm:h-5" />
              Meal Plan Left
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-1 sm:pt-2 pb-4 sm:pb-6 px-4 sm:px-6 text-center flex flex-col items-center justify-center">
            <p className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-none drop-shadow-lg">
              {formatCurrency(fundsData.mealPlanBalance, displayCurrency)}
            </p>
          </CardContent>
        </Card>

        {/* Flex Dollars Balance - Blue Theme */}
        <Card 
          className="flex-1 text-white border-0 shadow-lg hover:shadow-xl flex flex-col justify-center items-center overflow-hidden rounded-xl" 
          style={{ 
            background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
            transform: `perspective(1000px) rotateX(${cardTransforms.flexDollars?.rotateX || 0}deg) rotateY(${cardTransforms.flexDollars?.rotateY || 0}deg) scale(${cardTransforms.flexDollars?.scale || 1})`,
            transformStyle: 'preserve-3d',
            transition: 'transform 0.1s ease-out'
          }}
          onMouseMove={(e) => handleMouseMove(e, 'flexDollars')}
          onMouseLeave={() => handleMouseLeave('flexDollars')}
        >
          <CardHeader className="pb-0 pt-4 sm:pt-6 px-4 sm:px-6 flex flex-col items-center justify-center">
            <CardTitle className="text-sm sm:text-base lg:text-lg font-bold flex items-center justify-center gap-1.5 sm:gap-2 text-white mb-1 sm:mb-2 tracking-tight">
              <DollarSign className="w-10 h-10 sm:w-5 sm:h-5" />
              Flex Left
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-1 sm:pt-2 pb-4 sm:pb-6 px-4 sm:px-6 text-center flex flex-col items-center justify-center">
            <p className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-none drop-shadow-lg">
              {formatCurrency(fundsData.flexDollarsBalance, displayCurrency)}
            </p>
          </CardContent>
        </Card>

        {/* Total Spent - Orange Theme */}
        <Card 
          className="flex-1 text-white border-0 shadow-lg hover:shadow-xl flex flex-col justify-center items-center overflow-hidden rounded-xl" 
          style={{ 
            background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
            transform: `perspective(1000px) rotateX(${cardTransforms.totalSpent?.rotateX || 0}deg) rotateY(${cardTransforms.totalSpent?.rotateY || 0}deg) scale(${cardTransforms.totalSpent?.scale || 1})`,
            transformStyle: 'preserve-3d',
            transition: 'transform 0.1s ease-out'
          }}
          onMouseMove={(e) => handleMouseMove(e, 'totalSpent')}
          onMouseLeave={() => handleMouseLeave('totalSpent')}
        >
          <CardHeader className="pb-0 pt-4 sm:pt-6 px-4 sm:px-6 flex flex-col items-center justify-center">
            <CardTitle className="text-sm sm:text-base lg:text-lg font-bold flex items-center justify-center gap-1.5 sm:gap-2 text-white mb-1 sm:mb-2 tracking-tight">
              <TrendingDown className="w-10 h-10 sm:w-5 sm:h-5" />
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-1 sm:pt-2 pb-4 sm:pb-6 px-4 sm:px-6 text-center flex flex-col items-center justify-center">
            <p className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-none drop-shadow-lg">
              {formatCurrency(totalSpent, displayCurrency)}
            </p>
            <p className="text-xs sm:text-sm text-white/90 mt-2 sm:mt-3 font-semibold">
              {transactionCount} transaction{transactionCount !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
      </div>


      {/* Spending List - Full Height */}
      <style>{shakeAnimationStyle}</style>
      <Card className="flex-1 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-lg">
        <CardHeader className="px-4 sm:px-6 py-4 sm:py-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Title and Buttons Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-2">
              <CardTitle className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Spending by Label Field</CardTitle>
              <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap justify-start sm:justify-end">
              <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => setViewFormData({ name: "" })} className="text-xs sm:text-sm">
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden xs:inline">Create View</span>
                    <span className="xs:hidden">Label Field</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 mx-3">
                  <DialogHeader>
                    <DialogTitle className="text-gray-900 dark:text-white">Create New Label Field</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleViewSubmit} className="space-y-6 mt-4 flex flex-col">
                    <div className="flex flex-col space-y-2">
                      <Label htmlFor="view-name" className="text-gray-900 dark:text-white">Field name</Label>
                      <Input
                        id="view-name"
                        value={viewFormData.name}
                        onChange={(e) => setViewFormData({ name: e.target.value })}
                        placeholder="e.g. Res hall spending"
                        required
                        className="w-full bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600 mt-2"
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
                  }} className={`text-xs sm:text-sm ${showLabelShake ? 'shake-animation' : ''}`}>
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden xs:inline">Add Label</span>
                    <span className="xs:hidden">Label</span>
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-w-[90vw] max-h-[90vh] flex flex-col mx-3 bg-white dark:bg-gray-900">
                  <DialogHeader className="flex-shrink-0">
                    <DialogTitle className="text-gray-900 dark:text-white">{editingLabel ? "Edit Label" : "Add New Label"}</DialogTitle>
                  </DialogHeader>

                  <form onSubmit={handleLabelSubmit} className="space-y-4 mt-4 flex-1 flex flex-col overflow-hidden">
                    <div className="flex-shrink-0 space-y-4 overflow-y-auto pr-2">
                      <div>
                        <Label htmlFor="name" className="text-gray-900 dark:text-white">Label Name</Label>
                        <Input
                          id="name"
                          value={labelFormData.name}
                          onChange={(e) => setLabelFormData({ ...labelFormData, name: e.target.value })}
                          placeholder="e.g. Coffee"
                          required
                          className="bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600 mt-1.5"
                        />
                      </div>

                      <div>
                        <Label className="text-gray-900 dark:text-white">Label Color</Label>
                        <div className="flex items-center gap-3 mt-1.5">
                          <div className="flex flex-wrap gap-1 max-w-full">
                            {PRESET_COLORS.map((color) => (
                              <button
                                key={color}
                                type="button"
                                className={`w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform flex-shrink-0 ${labelFormData.color === color ? 'ring-2 ring-offset-1 ring-blue-500' : ''}`}
                                style={{ backgroundColor: color }}
                                onClick={() => setLabelFormData({ ...labelFormData, color })}
                                title={color}
                              />
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => setShowColorPicker(!showColorPicker)}
                            className="ml-2 w-8 h-8 rounded border border-gray-300 dark:border-gray-700 flex items-center justify-center text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                            title="Custom color"
                          >
                            <Plus className="w-3 h-3" />
                          </button>

                          {showColorPicker && (
                            <Input
                              type="color"
                              value={labelFormData.color}
                              onChange={(e) => setLabelFormData({ ...labelFormData, color: e.target.value })}
                              className="w-10 h-10 p-0 border-0 rounded ml-2"
                            />
                          )}
                        </div>
                      </div>

                      <div>
                        <Label className="text-gray-900 dark:text-white">Assign Transactions</Label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
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
                className="text-xs sm:text-sm"
              >
                <Edit2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                {isEditMode ? "Done" : "Edit"}
              </Button>
            </div>
            </div>
            {/* Filters Row */}
            <div className="flex flex-row gap-2 sm:gap-3 w-full">
              <div className="flex flex-col gap-1 flex-1 sm:flex-none relative">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Time</label>
                <div className="relative">
                  <button
                    onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                    className="w-full text-xs sm:text-sm h-9 sm:h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between"
                  >
                    <span>
                      {dateRange === 'day' && 'Today'}
                      {dateRange === 'week' && 'Last 7 Days'}
                      {dateRange === 'month' && 'Last 30 Days'}
                      {dateRange === 'year' && 'Last Year'}
                      {dateRange === 'all' && 'All Time'}
                    </span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </button>
                  {isTimeDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-50">
                      {[
                        { value: 'day', label: 'Today' },
                        { value: 'week', label: 'Last 7 Days' },
                        { value: 'month', label: 'Last 30 Days' },
                        { value: 'year', label: 'Last Year' },
                        { value: 'all', label: 'All Time' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setDateRange(option.value);
                            setIsTimeDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs sm:text-sm text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1 flex-1 sm:flex-none relative">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Field</label>
                <div className="relative">
                  <button
                    onClick={() => setIsFieldDropdownOpen(!isFieldDropdownOpen)}
                    className="w-full text-xs sm:text-sm h-9 sm:h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between"
                  >
                    <span>{views.find((v: View) => v.id === selectedViewId)?.name || 'View'}</span>
                    <svg className={`w-4 h-4 transition-transform ${isFieldDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </button>
                  {isFieldDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-50 w-full">
                      {views.map((view: View) => (
                        <div
                          key={view.id}
                          className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs sm:text-sm text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                        >
                          <button
                            onClick={() => {
                              setSelectedViewId(view.id);
                              setIsFieldDropdownOpen(false);
                            }}
                            className="flex-1 text-left truncate"
                          >
                            {view.name}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteView(view.id);
                            }}
                            className="ml-2 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500 hover:text-red-700 flex-shrink-0"
                            title="Delete view"
                          >
                            <X className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 py-4">
          {spendingData.length > 0 ? (
            <div className="space-y-2 sm:space-y-2.5 min-h-[400px] sm:min-h-[600px] max-h-[500px] sm:max-h-[700px] overflow-y-auto pr-1">
              {spendingData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 hover:shadow-md transition-all duration-200 gap-2 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex-shrink-0 shadow-sm ring-2 ring-white dark:ring-gray-800"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm sm:text-base truncate text-gray-900 dark:text-white">{item.name}</p>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        {item.transactionCount} transaction{item.transactionCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
                    <p className="text-base sm:text-xl font-bold whitespace-nowrap text-gray-900 dark:text-white">
                      {formatCurrency(item.spent, displayCurrency)}
                    </p>
                    {isEditMode && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditLabel(item.name)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                        {item.name !== "Other" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteLabel(item.name)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8 text-sm sm:text-base">
              No transactions for this view yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Transaction Selection Dialog */}
      <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
        <DialogContent className="max-w-[95vw] max-h-[85vh] flex flex-col mx-3 bg-white dark:bg-gray-900">
          <DialogHeader className="flex-shrink-0 pb-2">
            <DialogTitle className="text-gray-900 dark:text-white text-base sm:text-lg">Select Transactions for Label</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col space-y-3 flex-1 min-h-0">
            <div className="flex-shrink-0 flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="Search transactions..."
                value={transactionSearchQuery}
                onChange={(e) => setTransactionSearchQuery(e.target.value)}
                className="flex-1 bg-white dark:bg-gray-800 text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 border-gray-300 dark:border-gray-600"
              />
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleSelectAllTransactions} className="flex-1 sm:flex-none text-xs sm:text-sm">
                  Select All
                </Button>
                <Button type="button" variant="outline" onClick={handleDeselectAllTransactions} className="flex-1 sm:flex-none text-xs sm:text-sm">
                  Deselect All
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto border border-gray-200 dark:border-gray-800 rounded p-3 sm:p-4 min-h-0" style={{maxHeight: '50vh'}}>
              {availableTransactions.length === 0 ? (
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center py-8">No transactions available</p>
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
                        className={`p-2 sm:p-3 rounded border cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700"
                            : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                        onClick={() => {
                          setSelectedTransactionIds(prev =>
                            prev.includes(tx.id)
                              ? prev.filter(id => id !== tx.id)
                              : [...prev, tx.id]
                          );
                        }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                              {formatCurrency(tx.amount, displayCurrency)} • {tx.date}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{tx.note || "No note"}</p>
                            {currentLabel && (
                              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                Currently in: {currentLabel.name}
                              </p>
                            )}
                          </div>
                          <div className="ml-2 flex-shrink-0">
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
            <div className="flex-shrink-0 flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-gray-200 dark:border-gray-800">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {selectedTransactionIds.length} transaction{selectedTransactionIds.length !== 1 ? 's' : ''} selected
              </p>
              <Button type="button" onClick={() => setIsTransactionDialogOpen(false)} className="w-50% sm:w-50%">
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
