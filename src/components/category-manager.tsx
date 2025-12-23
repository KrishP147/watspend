import React, { useEffect } from "react";
import { useAppContext, Category } from "../App";
import { Card } from "./ui/card";

export function CategoryManager() {
  const {
    categories,
    transactions,
    views,
    selectedViewId,
    displayCurrency
  } = useAppContext();

  // This component is now simplified - label management happens in DashboardOverview
  const selectedView = views.find(v => v.id === selectedViewId);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-gray-900 dark:text-white text-lg font-semibold">Labels</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage labels from the Dashboard's "Spending by Label" section
          </p>
        </div>
      </div>

      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p className="mb-2">Label management has been moved to the Dashboard tab.</p>
        <p>You can create and edit labels in the "Spending by Label" section on the Dashboard.</p>
      </div>
    </Card>
  );
}
