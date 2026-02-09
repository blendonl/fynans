"use client";

import { useAuth } from "@/providers/auth-provider";
import { useTransactions, getStats } from "@/hooks/use-transactions";
import { StatsCard } from "@/components/dashboard/stats-card";
import { QuickActions } from "@/components/dashboard/quick-actions";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: transactions = [], isLoading } = useTransactions();
  const stats = getStats(transactions);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-text">
          Welcome back, {user?.firstName}
        </h1>
        <p className="text-text-secondary mt-1">Here&apos;s your financial overview</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-surface-variant animate-pulse" />
          ))}
        </div>
      ) : (
        <StatsCard {...stats} />
      )}

      <div>
        <h2 className="text-lg font-semibold text-text mb-4">Quick Actions</h2>
        <QuickActions />
      </div>
    </div>
  );
}
