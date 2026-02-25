"use client";

import { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useInfiniteTransactions } from "@/hooks/use-transactions";
import { usePendingTransactionCount } from "@/hooks/use-pending-transactions";
import { useFamilies } from "@/hooks/use-families";
import { useCategories } from "@/hooks/use-categories";
import { useBalance } from "@/hooks/use-balance";
import { usePaymentMethods } from "@/hooks/use-payment-methods";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { TransactionFilters, type AdvancedFilters } from "@/components/transactions/transaction-filters";
import { TransactionList } from "@/components/transactions/transaction-list";
import { TransactionsSummary } from "@/components/transactions/transactions-summary";
import { PendingTransactionList } from "@/components/transactions/pending-transaction-list";
import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/utils";
import { transactionControllerGetStatistics } from "@/api/generated/endpoints/transaction/transaction";

const EMPTY_ADVANCED: AdvancedFilters = {
  dateFrom: "",
  dateTo: "",
  minAmount: "",
  maxAmount: "",
  categories: [],
};

type TabValue = "confirmed" | "pending" | "rejected";

export default function TransactionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as TabValue) || "confirmed";

  const [activeTab, setActiveTab] = useState<TabValue>(initialTab);
  const [typeFilter, setTypeFilter] = useState("all");
  const [scopeFilter, setScopeFilter] = useState("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>(EMPTY_ADVANCED);
  const { families } = useFamilies();
  const { categories } = useCategories();
  const { paymentMethods } = usePaymentMethods();
  const { data: pendingCount } = usePendingTransactionCount();
  const { data: balanceData } = useBalance();

  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  const serverFilters = useMemo(() => ({
    type: typeFilter !== "all" ? typeFilter : undefined,
    scope: scopeFilter !== "all" ? scopeFilter : undefined,
    paymentMethodId: paymentMethodFilter,
    dateFrom: advancedFilters.dateFrom || undefined,
    dateTo: advancedFilters.dateTo || undefined,
    minAmount: advancedFilters.minAmount || undefined,
    maxAmount: advancedFilters.maxAmount || undefined,
    search: debouncedSearch.trim() || undefined,
  }), [typeFilter, scopeFilter, paymentMethodFilter, advancedFilters, debouncedSearch]);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteTransactions(serverFilters, families);

  // Server-side statistics matching the current filters
  const statsParams = useMemo(() => {
    const p: Record<string, string> = {};
    if (serverFilters.scope) p.scope = serverFilters.scope.toUpperCase();
    if (serverFilters.dateFrom) p.dateFrom = serverFilters.dateFrom;
    if (serverFilters.dateTo) p.dateTo = serverFilters.dateTo;
    if (serverFilters.minAmount) p.valueMin = serverFilters.minAmount;
    if (serverFilters.maxAmount) p.valueMax = serverFilters.maxAmount;
    if (paymentMethodFilter) p.paymentMethodId = paymentMethodFilter;
    return p;
  }, [serverFilters, paymentMethodFilter]);

  const { data: serverStats } = useQuery({
    queryKey: ["transactions-page-stats", statsParams],
    queryFn: async () => {
      const res = await transactionControllerGetStatistics(statsParams);
      return res.data;
    },
    staleTime: 30_000,
  });

  const stats = useMemo(() => ({
    totalExpenses: serverStats?.totalExpense ?? 0,
    totalIncome: serverStats?.totalIncome ?? 0,
    net: serverStats?.balance ?? 0,
  }), [serverStats]);

  const allTransactions = useMemo(
    () => data?.pages.flatMap((page) => page.transactions) ?? [],
    [data]
  );

  const filtered = useMemo(() => {
    if (advancedFilters.categories.length === 0) return allTransactions;

    return allTransactions.filter((t) => {
      return advancedFilters.categories.includes(t.category.id);
    });
  }, [allTransactions, advancedFilters.categories]);

  const loadMoreRef = useIntersectionObserver(() => fetchNextPage(), {
    enabled: !!hasNextPage && !isFetchingNextPage,
  });

  const handleTabChange = (tab: TabValue) => {
    setActiveTab(tab);
    const url = tab === "confirmed" ? "/transactions" : `/transactions?tab=${tab}`;
    router.replace(url, { scroll: false });
  };

  const tabs: { value: TabValue; label: string; count?: number }[] = [
    { value: "confirmed", label: "Confirmed" },
    { value: "pending", label: "Pending", count: pendingCount ?? 0 },
    { value: "rejected", label: "Rejected" },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        label="Overview"
        title="Transactions"
        description="View and manage all your expenses and income."
        className="dash-animate-in"
      />

      <div className="dash-animate-in dash-delay-1">
        <div role="tablist" className="flex rounded-2xl bg-surface-variant p-1 gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={cn(
                "relative flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2",
                activeTab === tab.value
                  ? "bg-surface text-text shadow-sm ring-1 ring-border-light"
                  : "text-text-secondary hover:text-text"
              )}
            >
              {tab.label}
              {tab.value === "pending" && (tab.count ?? 0) > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-warning/15 px-1.5 text-[11px] font-semibold text-warning">
                  {tab.count! > 99 ? "99+" : tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "confirmed" && (
        <div role="tabpanel" className="space-y-8">
          <div className="dash-animate-in dash-delay-1">
            <TransactionsSummary
              totalIncome={stats.totalIncome}
              totalExpenses={stats.totalExpenses}
              net={stats.net}
              allTimeBalance={balanceData?.totalBalance}
            />
          </div>

          <div className="dash-animate-in dash-delay-2">
            <TransactionFilters
              typeFilter={typeFilter}
              scopeFilter={scopeFilter}
              paymentMethodFilter={paymentMethodFilter}
              searchQuery={searchQuery}
              advancedFilters={advancedFilters}
              categories={categories}
              paymentMethods={paymentMethods}
              onTypeChange={setTypeFilter}
              onScopeChange={setScopeFilter}
              onPaymentMethodChange={setPaymentMethodFilter}
              onSearchChange={setSearchQuery}
              onAdvancedFiltersChange={setAdvancedFilters}
            />
          </div>

          <div className="dash-animate-in dash-delay-3">
            <TransactionList
              transactions={filtered}
              isLoading={isLoading}
              loadMoreRef={loadMoreRef}
              isFetchingNextPage={isFetchingNextPage}
              searchQuery={debouncedSearch || undefined}
              paymentMethods={paymentMethods}
            />
          </div>
        </div>
      )}

      {activeTab === "pending" && (
        <div role="tabpanel" className="dash-animate-in dash-delay-2">
          <PendingTransactionList status="PENDING" />
        </div>
      )}

      {activeTab === "rejected" && (
        <div role="tabpanel" className="dash-animate-in dash-delay-2">
          <PendingTransactionList status="REJECTED" />
        </div>
      )}
    </div>
  );
}
