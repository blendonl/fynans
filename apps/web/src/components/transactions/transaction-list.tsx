"use client";

import type { Transaction } from "@fynans/shared";
import { groupByMonth } from "@/hooks/use-transactions";
import { TransactionGroup } from "./transaction-group";
import { Card } from "@/components/ui/card";

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
}

export function TransactionList({ transactions, isLoading }: TransactionListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 rounded-lg bg-surface-variant animate-pulse" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-text-secondary">No transactions found</p>
      </Card>
    );
  }

  const groups = groupByMonth(transactions);

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <TransactionGroup
          key={group.key}
          monthLabel={group.monthLabel}
          total={group.total}
          transactions={group.transactions}
        />
      ))}
    </div>
  );
}
