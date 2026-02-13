"use client";

import { Trash2 } from "lucide-react";
import { formatCurrency } from "@fynans/shared";
import type { Transaction } from "@fynans/shared";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/glass/glass-card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TransactionDetailProps {
  transaction: Transaction;
  onDelete: () => void;
  isDeleting: boolean;
}

export function TransactionDetail({ transaction, onDelete, isDeleting }: TransactionDetailProps) {
  const isExpense = transaction.type === "expense";

  const date = transaction.transaction.createdAt
    ? new Date(transaction.transaction.createdAt).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

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
          {isExpense ? "−" : "+"}
          {formatCurrency(transaction.transaction.value)}
        </p>
        <div className="h-px my-5 rounded-full bg-gradient-to-r from-transparent via-primary/20 to-transparent gradient-line-shimmer" />
        <p className="text-sm text-text-secondary">{date}</p>
      </GlassCard>

      <GlassCard className="p-5 sm:p-6">
        <h3 className="text-[11px] font-medium text-text-secondary uppercase tracking-wider mb-4">
          Details
        </h3>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <p className="text-[11px] text-text-disabled uppercase tracking-wide">Category</p>
            <p className="text-sm font-medium text-text mt-0.5">{transaction.category.name}</p>
          </div>
          {transaction.store && (
            <div>
              <p className="text-[11px] text-text-disabled uppercase tracking-wide">Store</p>
              <p className="text-sm font-medium text-text mt-0.5">{transaction.store.name}</p>
              {transaction.store.location && (
                <p className="text-xs text-text-secondary">{transaction.store.location}</p>
              )}
            </div>
          )}
          <div>
            <p className="text-[11px] text-text-disabled uppercase tracking-wide">Scope</p>
            <p className="text-sm font-medium text-text mt-0.5">{transaction.scope}</p>
          </div>
          {transaction.transaction.user && (
            <div>
              <p className="text-[11px] text-text-disabled uppercase tracking-wide">By</p>
              <p className="text-sm font-medium text-text mt-0.5">
                {transaction.transaction.user.firstName} {transaction.transaction.user.lastName}
              </p>
            </div>
          )}
          {transaction.transaction.description && (
            <div className="col-span-2 pt-2 border-t border-border-light/50">
              <p className="text-[11px] text-text-disabled uppercase tracking-wide">Description</p>
              <p className="text-sm text-text mt-0.5">{transaction.transaction.description}</p>
            </div>
          )}
        </div>
      </GlassCard>

      {transaction.items && transaction.items.length > 0 && (
        <GlassCard className="p-5 sm:p-6">
          <h3 className="text-[11px] font-medium text-text-secondary uppercase tracking-wider mb-4">
            Items ({transaction.items.length})
          </h3>
          <div className="space-y-0">
            {transaction.items.map((item, i) => (
              <div
                key={i}
                className={`flex items-center justify-between py-3 ${
                  i % 2 === 1 ? "bg-surface-variant/20 -mx-5 px-5 sm:-mx-6 sm:px-6" : ""
                } ${i < transaction.items!.length - 1 ? "border-b border-border-light/30" : ""}`}
              >
                <div>
                  <p className="text-sm font-medium text-text">{item.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-text-secondary">Qty: {item.quantity}</span>
                    {item.discount ? (
                      <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                        −{formatCurrency(item.discount)}
                      </Badge>
                    ) : null}
                  </div>
                </div>
                <p className="text-sm font-semibold font-mono text-text tabular-nums">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {transaction.receiptImages && transaction.receiptImages.length > 0 && (
        <GlassCard className="p-5 sm:p-6">
          <h3 className="text-[11px] font-medium text-text-secondary uppercase tracking-wider mb-4">
            Receipts
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {transaction.receiptImages.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`Receipt ${i + 1}`}
                className="rounded-2xl ring-1 ring-border-light object-cover w-full"
              />
            ))}
          </div>
        </GlassCard>
      )}

      <div className="flex justify-center pt-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-expense hover:text-expense-light transition-colors">
              <Trash2 className="h-4 w-4" />
              Delete Transaction
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete transaction?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this transaction.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
