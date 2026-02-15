"use client";

import { useState, useMemo } from "react";
import { useInfiniteTransactions } from "@/hooks/use-transactions";
import { useFamilies } from "@/hooks/use-families";
import { useCategories } from "@/hooks/use-categories";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { TransactionFilters, type AdvancedFilters } from "@/components/transactions/transaction-filters";
import { TransactionList } from "@/components/transactions/transaction-list";
import { TransactionsSummary } from "@/components/transactions/transactions-summary";
import { PageHeader } from "@/components/ui/page-header";

const EMPTY_ADVANCED: AdvancedFilters = {
  dateFrom: "",
  dateTo: "",
  minAmount: "",
  maxAmount: "",
  categories: [],
};

export default function TransactionsPage() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [scopeFilter, setScopeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>(EMPTY_ADVANCED);
  const { families } = useFamilies();
  const { categories } = useCategories();

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

  return (
    <div className="space-y-8">
      <PageHeader
        label="Overview"
        title="Transactions"
        description="View and manage all your expenses and income."
        className="dash-animate-in"
      />

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
  );
}
