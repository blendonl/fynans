"use client";

import Link from "next/link";
import { Receipt, Plus, Loader2 } from "lucide-react";
import type { Transaction } from "@fynans/shared";
import { groupByMonth } from "@/hooks/use-transactions";
import { TransactionGroup } from "./transaction-group";

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
  loadMoreRef?: React.RefObject<HTMLDivElement | null>;
  isFetchingNextPage?: boolean;
  searchQuery?: string;
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
}: TransactionListProps) {
  if (isLoading) {
    return <TransactionListSkeleton />;
  }

  if (transactions.length === 0) {
    return (
      <div className="py-20 px-8 text-center">
        <div className="relative mx-auto mb-6 h-20 w-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10" />
          <Receipt className="h-10 w-10 text-text-disabled relative" />
        </div>
        <p className="text-base font-medium text-text-secondary">No transactions found</p>
        <p className="text-sm text-text-disabled mt-1 mb-6">
          Try adjusting your filters or add a new transaction
        </p>
        <Link
          href="/add"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary-variant transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Transaction
        </Link>
      </div>
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
