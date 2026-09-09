"use client";

import { Receipt, Loader2 } from "lucide-react";
import { EmptyState } from "@/components/onboarding/empty-state";
import type { Transaction } from "@/types";
import type { PaymentMethod } from "@/hooks/use-payment-methods";
import { groupByMonth } from "@/hooks/use-transactions";
import { TransactionGroup } from "./transaction-group";

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
  loadMoreRef?: React.RefObject<HTMLDivElement | null>;
  isFetchingNextPage?: boolean;
  searchQuery?: string;
  paymentMethods?: PaymentMethod[];
  hasActiveFilters?: boolean;
}

function TransactionListSkeleton() {
  return (
    <div className="space-y-8">
      {[0, 1].map((g) => (
        <div key={g} className="space-y-3">
          <div className="flex items-center gap-2.5 px-1">
            <div className="w-1 h-6 rounded-full bg-surface-variant skeleton-shimmer" />
            <div className="space-y-1.5">
              <div className="h-3.5 w-24 rounded-md bg-surface-variant skeleton-shimmer" />
              <div className="h-3 w-36 rounded-md bg-surface-variant skeleton-shimmer" />
            </div>
          </div>
          <div className="rounded-2xl bg-surface-variant/20 divide-y divide-border-light/50 overflow-hidden border border-glass-border-outer">
            {[0, 1, 2, 3].map((r) => (
              <div key={r} className="flex items-center gap-3 px-4 py-3.5">
                <div className="w-1 h-8 rounded-full bg-surface-variant skeleton-shimmer flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-24 rounded-md bg-surface-variant skeleton-shimmer" />
                  <div className="h-3 w-32 rounded-md bg-surface-variant skeleton-shimmer" />
                </div>
                <div className="h-4 w-16 rounded-md bg-surface-variant skeleton-shimmer" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function TransactionList({
  transactions,
  isLoading,
  loadMoreRef,
  isFetchingNextPage,
  searchQuery,
  paymentMethods = [],
  hasActiveFilters = false,
}: TransactionListProps) {
  if (isLoading) {
    return <TransactionListSkeleton />;
  }

  if (transactions.length === 0) {
    return hasActiveFilters ? (
      <EmptyState
        icon={Receipt}
        title="No transactions match these filters"
        description="Widen the date range, clear the search, or pick a different category."
      />
    ) : (
      <EmptyState
        icon={Receipt}
        title="No transactions yet"
        description="Scan a receipt and Fynans reads the store, the date and every line item for you. You can also just type an amount."
        actionLabel="Add your first transaction"
        actionHref="/add"
      />
    );
  }

  const groups = groupByMonth(transactions);

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <TransactionGroup
          key={group.key}
          monthLabel={group.monthLabel}
          total={group.total}
          income={group.income}
          expenses={group.expenses}
          matchedItemsTotal={group.matchedItemsTotal}
          transactions={group.transactions}
          searchQuery={searchQuery}
          paymentMethods={paymentMethods}
        />
      ))}

      {loadMoreRef && <div ref={loadMoreRef} className="h-1" />}

      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-text-secondary" />
        </div>
      )}
    </div>
  );
}
