"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  usePendingExpense,
  useApprovePendingExpense,
  useRejectPendingExpense,
  useResubmitExpense,
  useDeletePendingExpense,
} from "@/hooks/use-pending-transactions";
import { Button } from "@/components/ui/button";
import { PendingTransactionDetail } from "@/components/transactions/pending-transaction-detail";
import type { Transaction } from "@/types";

interface ExpenseWithStatus {
  id: string;
  transactionId: string;
  categoryId: string;
  storeId: string | null;
  status?: string;
  rejectionReason?: string;
  transaction: {
    id: string;
    userId: string;
    value: number;
    scope: string;
    recordedAt: string;
    description?: string;
    familyId?: string | null;
    user: { id: string; firstName: string; lastName: string; image?: string | null };
  };
  category: { id: string; name: string };
  store: { id: string; name: string; location?: string } | null;
  items: { name: string; price: number; discount?: number; quantity: number }[];
  receiptImages?: string[];
}

function mapToTransaction(expense: ExpenseWithStatus): Transaction & { status?: string; rejectionReason?: string } {
  return {
    id: expense.id,
    type: "expense",
    category: { id: expense.category.id, name: expense.category.name },
    store: expense.store
      ? { id: expense.store.id, name: expense.store.name, location: expense.store.location }
      : undefined,
    scope: (expense.transaction.scope as "PERSONAL" | "FAMILY") || "PERSONAL",
    familyId: expense.transaction.familyId,
    transaction: {
      id: expense.transaction.id || "",
      value: expense.transaction.value || 0,
      recordedAt: expense.transaction.recordedAt,
      description: expense.transaction.description,
      user: expense.transaction.user || { id: "", firstName: "", lastName: "" },
    },
    items: expense.items?.map((item) => ({
      name: item.name,
      price: item.price,
      discount: item.discount,
      quantity: item.quantity,
    })),
    receiptImages: expense.receiptImages || [],
    status: expense.status,
    rejectionReason: expense.rejectionReason,
  };
}

export default function PendingTransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const { data: expense, isLoading } = usePendingExpense(id);
  const approveMutation = useApprovePendingExpense();
  const rejectMutation = useRejectPendingExpense();
  const resubmitMutation = useResubmitExpense();
  const deleteMutation = useDeletePendingExpense();

  const handleApprove = () => {
    approveMutation.mutate(id, {
      onSuccess: () => router.push("/transactions?tab=pending"),
    });
  };

  const handleReject = (reason: string) => {
    rejectMutation.mutate(
      { id, rejectionReason: reason },
      { onSuccess: () => router.push("/transactions?tab=pending") },
    );
  };

  const handleResubmit = () => {
    resubmitMutation.mutate(
      { id },
      { onSuccess: () => router.push("/transactions?tab=pending") },
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(id, {
      onSuccess: () => router.push("/transactions?tab=pending"),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 rounded-md bg-surface-variant skeleton-shimmer" />
        <div className="h-56 rounded-2xl bg-surface-variant/30 skeleton-shimmer" />
        <div className="h-40 rounded-2xl bg-surface-variant/30 skeleton-shimmer" />
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Transaction not found</p>
      </div>
    );
  }

  const transaction = mapToTransaction(expense as unknown as ExpenseWithStatus);

  return (
    <div className="space-y-6 dash-animate-in">
      <Button variant="ghost" onClick={() => router.back()} className="text-text-secondary">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Transactions
      </Button>
      <PendingTransactionDetail
        transaction={transaction}
        onApprove={handleApprove}
        onReject={handleReject}
        onResubmit={handleResubmit}
        onDelete={handleDelete}
        isApproving={approveMutation.isPending}
        isRejecting={rejectMutation.isPending}
        isResubmitting={resubmitMutation.isPending}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
