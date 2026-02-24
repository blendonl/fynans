"use client";

import { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useInfiniteTransactions } from "@/hooks/use-transactions";
import { usePendingTransactionCount } from "@/hooks/use-pending-transactions";
import { useFamilies } from "@/hooks/use-families";
import { useCategories } from "@/hooks/use-categories";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { TransactionFilters, type AdvancedFilters } from "@/components/transactions/transaction-filters";
import { TransactionList } from "@/components/transactions/transaction-list";
import { TransactionsSummary } from "@/components/transactions/transactions-summary";
import { PendingTransactionList } from "@/components/transactions/pending-transaction-list";
import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/utils";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>(EMPTY_ADVANCED);
  const { families } = useFamilies();
  const { categories } = useCategories();
  const { data: pendingCount } = usePendingTransactionCount();

  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteTransactions(
    {
      type: typeFilter !== "all" ? typeFilter : undefined,
      scope: scopeFilter !== "all" ? scopeFilter : undefined,
      dateFrom: advancedFilters.dateFrom || undefined,
      dateTo: advancedFilters.dateTo || undefined,
      minAmount: advancedFilters.minAmount || undefined,
      maxAmount: advancedFilters.maxAmount || undefined,
      search: debouncedSearch.trim() || undefined,
    },
    families
  );

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

  const stats = useMemo(() => {
    if (!data?.pages.length) return { totalExpenses: 0, totalIncome: 0, net: 0, matchedItemsTotal: 0 };
    const totalExpenses = filtered
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.transaction.value, 0);
    const totalIncome = filtered
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.transaction.value, 0);
    const matchedItemsTotal = filtered.reduce((sum, t) => {
      if (!t.matchedItems?.length) return sum;
      return sum + t.matchedItems.reduce(
        (itemSum, item) => itemSum + (item.price - (item.discount || 0)) * item.quantity,
        0,
      );
    }, 0);
    return { totalExpenses, totalIncome, net: totalIncome - totalExpenses, matchedItemsTotal };
  }, [data, filtered]);

  const hasItemSearch = filtered.some((t) => t.matchedItems?.length);

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
              matchedItemsTotal={hasItemSearch ? stats.matchedItemsTotal : undefined}
            />
          </div>

          <div className="dash-animate-in dash-delay-2">
            <TransactionFilters
              typeFilter={typeFilter}
              scopeFilter={scopeFilter}
              searchQuery={searchQuery}
              advancedFilters={advancedFilters}
              categories={categories}
              onTypeChange={setTypeFilter}
              onScopeChange={setScopeFilter}
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
