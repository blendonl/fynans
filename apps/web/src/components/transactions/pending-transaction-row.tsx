"use client";

import Link from "next/link";
import { ChevronRight, Clock, XCircle, Receipt } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import type { Transaction } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface PendingTransactionRowProps {
  transaction: Transaction & { status?: string; rejectionReason?: string };
}

export function PendingTransactionRow({ transaction }: PendingTransactionRowProps) {
  const date = transaction.transaction.recordedAt
    ? new Date(transaction.transaction.recordedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "";

  const isRejected = transaction.status === "REJECTED";
  const user = transaction.transaction.user;
  const isExpense = transaction.type === "expense";
  const hasReceipts = transaction.receiptImages && transaction.receiptImages.length > 0;

  return (
    <Link href={`/transactions/pending/${transaction.id}?type=${transaction.type}`}>
      <div className="group flex items-center gap-3 px-4 py-3.5 hover:bg-surface-variant/50 transition-all cursor-pointer">
        <div
          className={`w-1 self-stretch rounded-full flex-shrink-0 ${
            isRejected ? "bg-expense/60" : "bg-warning/60"
          }`}
        />

        <Avatar className="h-7 w-7 flex-shrink-0 text-xs">
          {user.image && <AvatarImage src={user.image} alt={user.firstName} />}
          <AvatarFallback>{user.firstName?.charAt(0) || "?"}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-text truncate">
              {transaction.category.name}
            </p>
            {isRejected ? (
              <Badge variant="destructive" className="text-[10px] py-0 gap-1">
                <XCircle className="h-3 w-3" />
                Rejected
              </Badge>
            ) : (
              <Badge className="text-[10px] py-0 gap-1 bg-warning/15 text-warning border-warning/20">
                <Clock className="h-3 w-3" />
                Pending
              </Badge>
            )}
            {hasReceipts && (
              <Receipt className="h-3.5 w-3.5 text-text-secondary flex-shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary">{date}</span>
            {transaction.store && (
              <span className="text-xs text-text-secondary truncate">
                · {transaction.store.name}
              </span>
            )}
            {user.firstName && (
              <span className="text-xs text-text-secondary truncate">
                · {user.firstName}
              </span>
            )}
            {transaction.scope === "FAMILY" && (
              <Badge variant="secondary" className="text-[10px] py-0 flex-shrink-0">
                Family
              </Badge>
            )}
          </div>
          {isRejected && transaction.rejectionReason && (
            <p className="text-xs text-expense mt-1 truncate">
              {transaction.rejectionReason}
            </p>
          )}
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
