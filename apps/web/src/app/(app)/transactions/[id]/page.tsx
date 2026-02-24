"use client";

import { use, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Pencil, MoreHorizontal, Trash2 } from "lucide-react";
import { expenseControllerFindOne, expenseControllerRemove } from "@/api/generated/endpoints/expense/expense";
import { incomeControllerFindOne, incomeControllerRemove } from "@/api/generated/endpoints/income/income";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TransactionDetail } from "@/components/transactions/transaction-detail";
import type { Transaction } from "@/types";

export default function TransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const type = searchParams.get("type") || "expense";
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: transaction, isLoading } = useQuery({
    queryKey: ["transaction", id, type],
    queryFn: async () => {
      const res = type === "income"
        ? await incomeControllerFindOne(id)
        : await expenseControllerFindOne(id);
      const data = res.data as unknown as Record<string, unknown>;
      const tx = data.transaction as Record<string, unknown> | undefined;
      return {
        id: data.id as string,
        type: type as "expense" | "income",
        category: data.category as { id: string; name: string },
        store: data.store as Transaction["store"],
        scope: (tx?.scope as "PERSONAL" | "FAMILY") || "PERSONAL",
        familyId: tx?.familyId as string | undefined,
        transaction: {
          id: (tx?.id as string) || "",
          value: (tx?.value as number) || 0,
          recordedAt: tx?.recordedAt as string | undefined,
          description: tx?.description as string | undefined,
          user: tx?.user as { id: string; firstName: string; lastName: string; image?: string | null },
          paymentMethodId: tx?.paymentMethodId as string | undefined,
        },
        items: data.items as Transaction["items"],
        receiptImages: (data.receiptImages as string[]) || [],
      } satisfies Transaction;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (type === "income") {
        await incomeControllerRemove(id);
      } else {
        await expenseControllerRemove(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      router.push("/transactions");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 rounded-md bg-surface-variant skeleton-shimmer" />
        <div className="h-56 rounded-2xl bg-surface-variant/30 skeleton-shimmer" />
        <div className="h-40 rounded-2xl bg-surface-variant/30 skeleton-shimmer" />
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Transaction not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 dash-animate-in">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()} className="text-text-secondary">
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline ml-2">Back to Transactions</span>
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/transactions/${id}/edit?type=${type}`)}
          >
            <Pencil className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Edit</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-expense"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Transaction
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this transaction.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <TransactionDetail transaction={transaction} />
    </div>
  );
}
