"use client";

import Link from "next/link";
import { GlassCard } from "@/components/glass/glass-card";
import { formatCurrency } from "@fynans/shared";
import type { Transaction } from "@fynans/shared";
import { ArrowRight } from "lucide-react";

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <GlassCard className="p-6 h-full">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[11px] font-semibold text-text-secondary tracking-[0.2em] uppercase">
          Recent Activity
        </h3>
        <Link
          href="/transactions"
          className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-light transition-colors group"
        >
          View all
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {transactions.length === 0 ? (
        <p className="text-sm text-text-disabled py-8 text-center">No transactions yet</p>
      ) : (
        <div className="divide-y divide-border-light">
          {transactions.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`h-2 w-2 rounded-full flex-shrink-0 ${
                    t.type === "income" ? "bg-income" : "bg-expense"
                  }`}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text truncate">{t.category.name}</p>
                  <p className="text-[11px] text-text-disabled">
                    {t.transaction.recordedAt &&
                      new Date(t.transaction.recordedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                  </p>
                </div>
              </div>
              <p
                className={`text-sm font-semibold font-mono flex-shrink-0 ml-3 ${
                  t.type === "income" ? "text-income" : "text-expense"
                }`}
              >
                {t.type === "income" ? "+" : "\u2212"}
                {formatCurrency(t.transaction.value)}
              </p>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
