"use client";

import Link from "next/link";
import { formatCurrency } from "@fynans/shared";
import type { Transaction } from "@fynans/shared";
import { Badge } from "@/components/ui/badge";

interface TransactionRowProps {
  transaction: Transaction;
}

export function TransactionRow({ transaction }: TransactionRowProps) {
  const date = transaction.transaction.createdAt
    ? new Date(transaction.transaction.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <Link href={`/transactions/${transaction.id}?type=${transaction.type}`}>
      <div className="flex items-center justify-between p-4 rounded-lg hover:bg-surface-variant transition-colors cursor-pointer">
        <div className="flex items-center gap-3">
          <div
            className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium ${
              transaction.type === "expense"
                ? "bg-expense/10 text-expense"
                : "bg-income/10 text-income"
            }`}
          >
            {transaction.type === "expense" ? "−" : "+"}
          </div>
          <div>
            <p className="text-sm font-medium text-text">{transaction.category.name}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-secondary">{date}</span>
              {transaction.store && (
                <span className="text-xs text-text-secondary">· {transaction.store.name}</span>
              )}
              {transaction.scope === "FAMILY" && (
                <Badge variant="secondary" className="text-[10px] py-0">Family</Badge>
              )}
            </div>
          </div>
        </div>
        <span
          className={`text-sm font-semibold ${
            transaction.type === "expense" ? "text-expense" : "text-income"
          }`}
        >
          {transaction.type === "expense" ? "−" : "+"}
          {formatCurrency(transaction.transaction.value)}
        </span>
      </div>
    </Link>
  );
}
