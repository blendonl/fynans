"use client";

import { GlassCard } from "@/components/glass/glass-card";
import { formatCurrency } from "@fynans/shared";

interface TopExpensesProps {
  expensesByCategory: { categoryId: string; categoryName: string; total: number }[];
}

export function TopExpenses({ expensesByCategory }: TopExpensesProps) {
  const topCategories = expensesByCategory.slice(0, 5);
  const maxValue = topCategories[0]?.total || 0;

  return (
    <GlassCard className="p-6">
      <h3 className="text-[11px] font-semibold text-text-secondary tracking-[0.2em] uppercase mb-5">
        Top Expenses
      </h3>

      {topCategories.length === 0 ? (
        <p className="text-sm text-text-disabled py-8 text-center">No expenses yet</p>
      ) : (
        <div className="space-y-3">
          {topCategories.map((cat, i) => {
            const percent = maxValue > 0 ? (cat.total / maxValue) * 100 : 0;
            return (
              <div key={cat.categoryId}>
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="text-xs font-bold font-mono text-text-disabled w-5 text-right">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-text truncate">
                        {cat.categoryName}
                      </span>
                      <span className="text-sm font-bold font-mono text-expense ml-2">
                        {formatCurrency(cat.total)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-5" />
                  <div className="flex-1">
                    <div className="h-1.5 rounded-full bg-surface-variant overflow-hidden">
                      <div
                        className="h-full rounded-full bg-expense/60"
                        style={{
                          ["--bar-width" as string]: `${percent}%`,
                          animation: "bar-grow 0.6s ease-out forwards",
                          animationDelay: `${i * 80 + 400}ms`,
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-text-disabled mt-1">
                      {Math.round(percent)}% of top
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
}
