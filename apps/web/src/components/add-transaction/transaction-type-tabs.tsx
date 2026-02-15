"use client";

import { cn } from "@/lib/utils";

interface TransactionTypeTabsProps {
  value: "expense" | "income";
  onChange: (value: "expense" | "income") => void;
}

export function TransactionTypeTabs({ value, onChange }: TransactionTypeTabsProps) {
  return (
    <div className="relative flex rounded-2xl bg-surface-variant p-1 gap-1">
      <button
        type="button"
        onClick={() => onChange("expense")}
        className={cn(
          "relative z-10 flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 cursor-pointer",
          value === "expense"
            ? "bg-expense/10 text-expense shadow-sm ring-1 ring-expense/20"
            : "text-text-secondary hover:text-text"
        )}
      >
        Expense
      </button>
      <button
        type="button"
        onClick={() => onChange("income")}
        className={cn(
          "relative z-10 flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 cursor-pointer",
          value === "income"
            ? "bg-income/10 text-income shadow-sm ring-1 ring-income/20"
            : "text-text-secondary hover:text-text"
        )}
      >
        Income
      </button>
    </div>
  );
}
