"use client";

import { useAuth } from "@/providers/auth-provider";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { BalanceHero } from "@/components/dashboard/balance-hero";
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown";
import { TopExpenses } from "@/components/dashboard/top-expenses";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { stats, recentTransactions, expensesByCategory, isLoading } = useDashboardData();

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <div className="dash-animate-in">
        <p className="text-[11px] font-semibold text-text-secondary tracking-[0.2em] uppercase">
          {getGreeting()}
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-text mt-1">
          {user?.firstName}
        </h1>
      </div>

      <div className="dash-animate-in dash-delay-1">
        <BalanceHero {...stats} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 dash-animate-in dash-delay-2">
        <div className="lg:col-span-5">
          <CategoryBreakdown expensesByCategory={expensesByCategory} />
        </div>
        <div className="lg:col-span-7">
          <RecentTransactions transactions={recentTransactions} />
        </div>
      </div>

      <div className="dash-animate-in dash-delay-3">
        <TopExpenses expensesByCategory={expensesByCategory} />
      </div>

      <div className="dash-animate-in dash-delay-4">
        <QuickActions />
      </div>
    </div>
  );
}
