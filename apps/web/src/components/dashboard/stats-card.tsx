"use client";

import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { GlassCard } from "@/components/glass/glass-card";
import { formatCurrency } from "@fynans/shared";

interface StatsCardProps {
  totalIncome: number;
  totalExpenses: number;
  net: number;
  count: number;
}

export function StatsCard({ totalIncome, totalExpenses, net, count }: StatsCardProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <GlassCard className="p-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-income/10 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-income" />
          </div>
          <div>
            <p className="text-sm text-text-secondary">Income</p>
            <p className="text-xl font-bold text-income">{formatCurrency(totalIncome)}</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-expense/10 flex items-center justify-center">
            <TrendingDown className="h-5 w-5 text-expense" />
          </div>
          <div>
            <p className="text-sm text-text-secondary">Expenses</p>
            <p className="text-xl font-bold text-expense">{formatCurrency(totalExpenses)}</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-text-secondary">Net</p>
            <p className={`text-xl font-bold ${net >= 0 ? "text-income" : "text-expense"}`}>
              {formatCurrency(net)}
            </p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
            <span className="text-info font-bold text-sm">#</span>
          </div>
          <div>
            <p className="text-sm text-text-secondary">Transactions</p>
            <p className="text-xl font-bold text-text">{count}</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
