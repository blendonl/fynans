"use client";

import { formatCurrency } from "@/utils/currency";
import type { Transaction } from "@/types";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/glass/glass-card";
import { TransactionDetailsCard } from "./transaction-details-card";
import { TransactionItemsList } from "./transaction-items-list";
import { ReceiptGallery } from "./receipt-gallery";

interface TransactionDetailProps {
  transaction: Transaction;
}

export function TransactionDetail({ transaction }: TransactionDetailProps) {
  const isExpense = transaction.type === "expense";

  const date = transaction.transaction.recordedAt
    ? new Date(transaction.transaction.recordedAt).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const receiptImages = transaction.receiptImages || [];

  return (
    <div className="space-y-6">
      <GlassCard variant="strong" className="p-6 sm:p-8 text-center">
        <Badge
          variant={isExpense ? "expense" : "income"}
          className="mx-auto mb-4"
        >
          {isExpense ? "Expense" : "Income"}
        </Badge>
        <p
          className={`text-4xl sm:text-5xl font-bold font-mono tabular-nums amount-animate ${
            isExpense ? "text-expense" : "text-income"
          }`}
        >
          {isExpense ? "\u2212" : "+"}
          {formatCurrency(transaction.transaction.value)}
        </p>
        <div className="h-px my-5 rounded-full bg-gradient-to-r from-transparent via-primary/20 to-transparent gradient-line-shimmer" />
        <p className="text-sm text-text-secondary">{date}</p>
      </GlassCard>

      <div className="lg:grid lg:grid-cols-12 lg:gap-6 space-y-6 lg:space-y-0">
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6 lg:self-start">
          <TransactionDetailsCard
            data={{
              category: transaction.category,
              store: transaction.store,
              note: transaction.transaction.description,
              scope: transaction.scope,
              user: transaction.transaction.user,
            }}
            type={transaction.type}
          />

          <ReceiptGallery images={receiptImages} />
        </div>

        <div className="lg:col-span-7 space-y-6">
          {transaction.items && (
            <TransactionItemsList items={transaction.items} />
          )}
        </div>
      </div>
    </div>
  );
}
