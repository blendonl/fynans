"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { formatCurrency } from "@fynans/shared";
import type { Transaction } from "@fynans/shared";
import { Badge } from "@/components/ui/badge";

interface TransactionRowProps {
  transaction: Transaction;
  style?: React.CSSProperties;
}

export function TransactionRow({ transaction, style }: TransactionRowProps) {
  const date = transaction.transaction.createdAt
    ? new Date(transaction.transaction.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "";

  const isExpense = transaction.type === "expense";

  return (
    <Link href={`/transactions/${transaction.id}?type=${transaction.type}`}>
      <div
        className="transaction-row group flex items-center gap-3 px-4 py-3.5 hover:bg-surface-variant/50 transition-all cursor-pointer dash-animate-in"
        style={style}
      >
        <div
          className={`w-1 self-stretch rounded-full flex-shrink-0 ${
            isExpense ? "bg-expense/60" : "bg-income/60"
          }`}
        />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text truncate">{transaction.category.name}</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary">{date}</span>
            {transaction.store && (
              <span className="text-xs text-text-secondary truncate">
                · {transaction.store.name}
              </span>
            )}
            {transaction.scope === "FAMILY" && (
              <Badge variant="secondary" className="text-[10px] py-0 flex-shrink-0">
                Family
              </Badge>
            )}
          </div>
        </div>

        <span
          className={`text-sm font-semibold font-mono tabular-nums flex-shrink-0 ${
            isExpense ? "text-expense" : "text-income"
          }`}
        >
          {isExpense ? "−" : "+"}
          {formatCurrency(transaction.transaction.value)}
        </span>

        <ChevronRight className="h-4 w-4 text-text-disabled opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 -mr-1" />
      </div>
    </Link>
  );
}
