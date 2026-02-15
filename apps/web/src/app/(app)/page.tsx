"use client";

import { useAuth } from "@/providers/auth-provider";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { DashboardFilterProvider, useDashboardFilter } from "@/contexts/dashboard-filter-context";
import { DashboardDateFilter } from "@/components/dashboard/dashboard-date-filter";
import { BalanceHero } from "@/components/dashboard/balance-hero";
import { ExpenseTrendChart } from "@/components/dashboard/expense-trend-chart";
import { CategoryComparisonChart } from "@/components/dashboard/category-comparison-chart";
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

function DashboardContent() {
  const { user } = useAuth();
  const { dateRange, previousRange } = useDashboardFilter();
  const {
    stats,
    comparison,
    recentTransactions,
    expensesByCategory,
    previousExpensesByCategory,
    trendData,
    isLoading,
  } = useDashboardData({
    dateFrom: dateRange.dateFrom,
    dateTo: dateRange.dateTo,
    previousDateFrom: previousRange.dateFrom,
    previousDateTo: previousRange.dateTo,
  });

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <div className="dash-animate-in">
        <p className="text-[11px] font-semibold text-text-secondary tracking-[0.2em] uppercase">
          {getGreeting()}
        </p>
        <h1 className="text-xl sm:text-2xl font-bold text-text mt-1">
          {user?.firstName}
        </h1>
      </div>

      <div className="dash-animate-in dash-delay-1">
        <DashboardDateFilter />
      </div>

      <div className="dash-animate-in dash-delay-1">
        <BalanceHero {...stats} comparison={comparison} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 dash-animate-in dash-delay-2">
        <ExpenseTrendChart data={trendData} />
        <CategoryComparisonChart
          current={expensesByCategory}
          previous={previousExpensesByCategory}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 dash-animate-in dash-delay-3">
        <div className="lg:col-span-5">
          <CategoryBreakdown expensesByCategory={expensesByCategory} />
        </div>
        <div className="lg:col-span-7">
          <RecentTransactions transactions={recentTransactions} />
        </div>
      </div>

      <div className="dash-animate-in dash-delay-4">
        <TopExpenses expensesByCategory={expensesByCategory} />
      </div>

      <div className="dash-animate-in dash-delay-4">
        <QuickActions />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <DashboardFilterProvider>
      <DashboardContent />
    </DashboardFilterProvider>
  );
}
