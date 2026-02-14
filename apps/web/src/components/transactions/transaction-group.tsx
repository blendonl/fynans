"use client";

import { formatCurrency } from "@fynans/shared";
import type { Transaction } from "@fynans/shared";
import { GlassCard } from "@/components/glass/glass-card";
import { TransactionRow } from "./transaction-row";

interface TransactionGroupProps {
  monthLabel: string;
  total: number;
  income: number;
  expenses: number;
  matchedItemsTotal: number;
  transactions: Transaction[];
  searchQuery?: string;
}

export function TransactionGroup({
  monthLabel,
  total,
  income,
  expenses,
  matchedItemsTotal,
  transactions,
  searchQuery,
}: TransactionGroupProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-1 h-6 rounded-full bg-primary/50" />
          <div>
            <h3 className="text-sm font-semibold text-text">{monthLabel}</h3>
            <div className="flex items-center gap-3 mt-0.5">
              {matchedItemsTotal > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="text-[11px] font-mono text-primary">{formatCurrency(matchedItemsTotal)}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-income" />
                <span className="text-[11px] font-mono text-income">{formatCurrency(income)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-expense" />
                <span className="text-[11px] font-mono text-expense">{formatCurrency(expenses)}</span>
              </div>
            </div>
          </div>
        </div>
        <span
          className={`text-sm font-bold font-mono tabular-nums ${
            total >= 0 ? "text-income" : "text-expense"
          }`}
        >
          {total >= 0 ? "+" : "−"}
          {formatCurrency(Math.abs(total))}
        </span>
      </div>

      <GlassCard className="overflow-hidden">
        <div className="divide-y divide-border-light/50">
          {transactions.map((t, i) => (
            <TransactionRow
              key={t.id}
              transaction={t}
              searchQuery={searchQuery}
              style={{ animationDelay: `${i * 40}ms` }}
            />
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
