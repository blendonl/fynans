"use client";

import { formatCurrency } from "@fynans/shared";
import type { Transaction } from "@fynans/shared";
import { TransactionRow } from "./transaction-row";

interface TransactionGroupProps {
  monthLabel: string;
  total: number;
  transactions: Transaction[];
}

export function TransactionGroup({ monthLabel, total, transactions }: TransactionGroupProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between px-4 py-2">
        <h3 className="text-sm font-semibold text-text">{monthLabel}</h3>
        <span className="text-sm text-text-secondary">{formatCurrency(total)}</span>
      </div>
      <div className="space-y-0.5">
        {transactions.map((t) => (
          <TransactionRow key={t.id} transaction={t} />
        ))}
      </div>
    </div>
  );
}
