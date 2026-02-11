"use client";

import { Trash2 } from "lucide-react";
import { formatCurrency } from "@fynans/shared";
import type { Transaction } from "@fynans/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
      <Card>
        <CardHeader className="text-center pb-2">
          <Badge variant={transaction.type === "expense" ? "expense" : "income"} className="mx-auto mb-2">
            {transaction.type === "expense" ? "Expense" : "Income"}
          </Badge>
          <p
            className={`text-4xl font-bold ${
              transaction.type === "expense" ? "text-expense" : "text-income"
            }`}
          >
            {transaction.type === "expense" ? "−" : "+"}
            {formatCurrency(transaction.transaction.value)}
          </p>
          <p className="text-sm text-text-secondary mt-2">{date}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-text-secondary">Category</p>
              <p className="text-sm font-medium text-text">{transaction.category.name}</p>
            </div>
            {transaction.store && (
              <div>
                <p className="text-xs text-text-secondary">Store</p>
                <p className="text-sm font-medium text-text">{transaction.store.name}</p>
                {transaction.store.location && (
                  <p className="text-xs text-text-secondary">{transaction.store.location}</p>
                )}
              </div>
            )}
            <div>
              <p className="text-xs text-text-secondary">Scope</p>
              <p className="text-sm font-medium text-text">{transaction.scope}</p>
            </div>
            {transaction.transaction.user && (
              <div>
                <p className="text-xs text-text-secondary">By</p>
                <p className="text-sm font-medium text-text">
                  {transaction.transaction.user.firstName} {transaction.transaction.user.lastName}
                </p>
              </div>
            )}
          </div>

          {transaction.transaction.description && (
            <>
              <Separator />
              <div>
                <p className="text-xs text-text-secondary">Description</p>
                <p className="text-sm text-text">{transaction.transaction.description}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {transaction.items && transaction.items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Items ({transaction.items.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transaction.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border-light last:border-0">
                  <div>
                    <p className="text-sm font-medium text-text">{item.name}</p>
                    <p className="text-xs text-text-secondary">
                      Qty: {item.quantity}
                      {item.discount ? ` · Discount: ${formatCurrency(item.discount)}` : ""}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-text">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {transaction.receiptImages && transaction.receiptImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Receipts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {transaction.receiptImages.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Receipt ${i + 1}`}
                  className="rounded-lg border border-border object-cover w-full"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="w-full">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Transaction
          </Button>
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
  );
}
