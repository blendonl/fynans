"use client";

import { GlassCard } from "@/components/glass/glass-card";
import { formatCurrency } from "@fynans/shared";

interface TransactionsSummaryProps {
  totalIncome: number;
  totalExpenses: number;
  net: number;
}

export function TransactionsSummary({ totalIncome, totalExpenses, net }: TransactionsSummaryProps) {
  return (
    <GlassCard variant="strong" className="p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wide">
            Net Balance
          </span>
          <p
            className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums mt-0.5 ${
              net >= 0 ? "text-income" : "text-expense"
            }`}
          >
            {net >= 0 ? "+" : "−"}
            {formatCurrency(Math.abs(net))}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-income/8">
            <span className="h-2 w-2 rounded-full bg-income" />
            <span className="text-xs font-semibold font-mono text-income">
              {formatCurrency(totalIncome)}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-expense/8">
            <span className="h-2 w-2 rounded-full bg-expense" />
            <span className="text-xs font-semibold font-mono text-expense">
              {formatCurrency(totalExpenses)}
            </span>
          </div>
        </div>
      </div>

      <div className="h-px mt-5 rounded-full bg-gradient-to-r from-income/40 via-primary/10 to-expense/40 gradient-line-shimmer" />
    </GlassCard>
  );
}
