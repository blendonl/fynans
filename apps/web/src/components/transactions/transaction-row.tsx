"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { formatCurrency } from "@fynans/shared";
import type { Transaction } from "@fynans/shared";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface TransactionRowProps {
  transaction: Transaction;
  searchQuery?: string;
  style?: React.CSSProperties;
}

function HighlightText({ text, query }: { text: string; query?: string }) {
  if (!query) return <>{text}</>;

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const idx = lowerText.indexOf(lowerQuery);

  if (idx === -1) return <>{text}</>;

  return (
    <>
      {text.slice(0, idx)}
      <span className="text-primary font-bold">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  );
}

export function TransactionRow({ transaction, searchQuery, style }: TransactionRowProps) {
  const date = transaction.transaction.recordedAt
    ? new Date(transaction.transaction.recordedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "";

  const isExpense = transaction.type === "expense";
  const user = transaction.transaction.user;
  const matchedItems = transaction.matchedItems;
  const hasMatchedItems = matchedItems && matchedItems.length > 0;

  const matchedItemsTotal = hasMatchedItems
    ? matchedItems.reduce(
        (sum, item) => sum + (item.price - (item.discount || 0)) * item.quantity,
        0,
      )
    : 0;

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

        <Avatar className="h-7 w-7 flex-shrink-0 text-xs">
          {user.image && <AvatarImage src={user.image} alt={user.firstName} />}
          <AvatarFallback>{user.firstName?.charAt(0) || "?"}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text truncate">
            <HighlightText text={transaction.category.name} query={searchQuery} />
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary">{date}</span>
            {transaction.store && (
              <span className="text-xs text-text-secondary truncate">
                · <HighlightText text={transaction.store.name} query={searchQuery} />
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

          {hasMatchedItems && (
            <div className="mt-1.5 space-y-0.5">
              {matchedItems.map((item, idx) => (
                <div key={idx} className="text-xs text-primary/80 flex items-center gap-1.5">
                  <span className="text-primary/50">-</span>
                  <span className="font-medium truncate">
                    <HighlightText text={item.name} query={searchQuery} />
                  </span>
                  <span className="text-text-disabled flex-shrink-0">
                    {formatCurrency((item.price - (item.discount || 0)) * item.quantity)}
                    {item.quantity > 1 && ` (x${item.quantity})`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
          {hasMatchedItems ? (
            <>
              <span className="text-sm font-semibold font-mono tabular-nums text-primary">
                {formatCurrency(matchedItemsTotal)}
              </span>
              <span className="text-[11px] text-text-disabled font-mono tabular-nums">
                / {formatCurrency(transaction.transaction.value)}
              </span>
            </>
          ) : (
            <span
              className={`text-sm font-semibold font-mono tabular-nums ${
                isExpense ? "text-expense" : "text-income"
              }`}
            >
              {isExpense ? "−" : "+"}
              {formatCurrency(transaction.transaction.value)}
            </span>
          )}
        </div>

        <ChevronRight className="h-4 w-4 text-text-disabled opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 -mr-1" />
      </div>
    </Link>
  );
}
