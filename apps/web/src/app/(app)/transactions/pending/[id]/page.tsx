"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
  usePendingExpense,
  useApprovePendingExpense,
  useRejectPendingExpense,
  useResubmitExpense,
  useUpdatePendingExpense,
  useDeletePendingExpense,
  pendingKeys,
} from "@/hooks/use-pending-transactions";
import {
  expenseItemControllerCreate,
  expenseItemControllerRemove,
} from "@/api/generated/endpoints/expense-items/expense-items";
import { Button } from "@/components/ui/button";
import {
  PendingTransactionDetail,
  type PendingExpenseData,
  type ItemsSync,
} from "@/components/transactions/pending-transaction-detail";

/**
 * Syncs local item changes to the API using a delete-all + recreate strategy.
 *
 * NOTE: This is not atomic — if a create fails mid-loop, previously deleted
 * items are lost and only some new items will exist. A backend batch endpoint
 * would be needed for true atomicity.
 */
async function syncExpenseItems(itemsSync: ItemsSync) {
  // Delete all original items
  await Promise.all(
    itemsSync.originalIds.map((itemId) =>
      expenseItemControllerRemove(itemId),
    ),
  );

  // Create current items (requires a storeId)
  if (itemsSync.storeId && itemsSync.items.length > 0) {
    for (const item of itemsSync.items) {
      await expenseItemControllerCreate(
        {
          expenseId: itemsSync.expenseId,
          categoryId: item.categoryId,
          itemName: item.name,
          itemPrice: item.price,
          discount: item.discount || undefined,
          quantity: item.quantity || undefined,
          sizeValue: item.size?.value,
          sizeUnit: item.size?.unit as
            | "kg"
            | "g"
            | "l"
            | "ml"
            | "cl"
            | undefined,
        },
        { storeId: itemsSync.storeId },
      );
    }
  }
}

export default function PendingTransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: expense, isLoading } = usePendingExpense(id);
  const approveMutation = useApprovePendingExpense();
  const rejectMutation = useRejectPendingExpense();
  const resubmitMutation = useResubmitExpense();
  const updateMutation = useUpdatePendingExpense();
  const deleteMutation = useDeletePendingExpense();

  // Local loading state that covers the full async flow (sync + update + action)
  const [isSaving, setIsSaving] = useState(false);

  // Key to force remount after save so refs/state reset from fresh data
  const [resetKey, setResetKey] = useState(0);

  const handleApprove = async (
    changes?: Record<string, unknown>,
    itemsSync?: ItemsSync,
  ) => {
    setIsSaving(true);
    try {
      if (itemsSync) await syncExpenseItems(itemsSync);
      if (changes && Object.keys(changes).length > 0) {
        await updateMutation.mutateAsync({ id, data: changes });
      }
      await approveMutation.mutateAsync(id);
      router.push("/transactions?tab=pending");
    } catch {
      // Error toasts handled by each mutation's onError
    } finally {
      setIsSaving(false);
    }
  };

  const handleReject = (reason: string) => {
    rejectMutation.mutate(
      { id, rejectionReason: reason },
      { onSuccess: () => router.push("/transactions?tab=pending") },
    );
  };

  const handleResubmit = async (
    changes?: Record<string, unknown>,
    itemsSync?: ItemsSync,
  ) => {
    setIsSaving(true);
    try {
      if (itemsSync) await syncExpenseItems(itemsSync);
      // Persist note/storeId via update first (resubmit DTO doesn't support them)
      if (changes && Object.keys(changes).length > 0) {
        await updateMutation.mutateAsync({ id, data: changes });
      }
      await resubmitMutation.mutateAsync({ id });
      router.push("/transactions?tab=pending");
    } catch {
      // Error toasts handled by each mutation's onError
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async (
    changes: Record<string, unknown>,
    itemsSync?: ItemsSync,
  ) => {
    setIsSaving(true);
    try {
      if (itemsSync) await syncExpenseItems(itemsSync);
      if (Object.keys(changes).length > 0) {
        await updateMutation.mutateAsync({ id, data: changes });
      } else if (itemsSync) {
        toast.success("Pending expense updated");
        queryClient.invalidateQueries({ queryKey: pendingKeys.all });
      }
      // Refetch detail so the component remounts with fresh data
      await queryClient.refetchQueries({
        queryKey: pendingKeys.detail(id),
      });
      setResetKey((k) => k + 1);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update expense",
      );
    } finally {
      setIsSaving(false);
    }
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

  return (
    <div className="space-y-6 dash-animate-in">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="text-text-secondary"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Transactions
      </Button>
      <PendingTransactionDetail
        key={resetKey}
        expense={expense as unknown as PendingExpenseData}
        onApprove={handleApprove}
        onReject={handleReject}
        onResubmit={handleResubmit}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        isApproving={isSaving || approveMutation.isPending}
        isRejecting={rejectMutation.isPending}
        isResubmitting={isSaving || resubmitMutation.isPending}
        isUpdating={isSaving || updateMutation.isPending}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
