"use client";

import { useTransactions, getStats } from "@/hooks/use-transactions";
import { formatCurrency } from "@fynans/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/glass/glass-card";

export default function AnalyticsPage() {
  const { data: transactions = [], isLoading } = useTransactions();
  const stats = getStats(transactions);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-text">Analytics</h1>
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-surface-variant animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-text">Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard className="p-6">
          <p className="text-sm text-text-secondary">Total Expenses</p>
          <p className="text-3xl font-bold text-expense mt-2">{formatCurrency(stats.totalExpenses)}</p>
        </GlassCard>
        <GlassCard className="p-6">
          <p className="text-sm text-text-secondary">Total Income</p>
          <p className="text-3xl font-bold text-income mt-2">{formatCurrency(stats.totalIncome)}</p>
        </GlassCard>
        <GlassCard className="p-6">
          <p className="text-sm text-text-secondary">Net Balance</p>
          <p className={`text-3xl font-bold mt-2 ${stats.net >= 0 ? "text-income" : "text-expense"}`}>
            {formatCurrency(stats.net)}
          </p>
        </GlassCard>
        <GlassCard className="p-6">
          <p className="text-sm text-text-secondary">Transactions</p>
          <p className="text-3xl font-bold text-text mt-2">{stats.count}</p>
        </GlassCard>
      </div>

      {transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions
                .filter((t) => t.type === "expense")
                .sort((a, b) => b.transaction.value - a.transaction.value)
                .slice(0, 5)
                .map((t) => (
                  <div key={t.id} className="flex items-center justify-between py-2 border-b border-border-light last:border-0">
                    <div>
                      <p className="text-sm font-medium text-text">{t.category.name}</p>
                      <p className="text-xs text-text-secondary">
                        {t.transaction.createdAt && new Date(t.transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-expense">{formatCurrency(t.transaction.value)}</p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
