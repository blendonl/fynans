"use client";

import { use, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, X, RotateCcw, MoreHorizontal, Trash2 } from "lucide-react";
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
import {
  PendingTransactionDetail,
  type PendingExpenseData,
  type PendingTransactionActions,
  type ItemsSync,
} from "@/components/transactions/pending-transaction-detail";
import { RejectDialog } from "@/components/transactions/reject-dialog";

async function syncExpenseItems(itemsSync: ItemsSync) {
  await Promise.all(
    itemsSync.originalIds.map((itemId) =>
      expenseItemControllerRemove(itemId),
    ),
  );

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

  const [isSaving, setIsSaving] = useState(false);

  const [resetKey, setResetKey] = useState(0);

  const actionsRef = useRef<PendingTransactionActions | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const handleActionsReady = useCallback((actions: PendingTransactionActions) => {
    actionsRef.current = actions;
    setHasChanges(actions.hasChanges);
  }, []);

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
    } catch (err) {
      if (!(err instanceof Error && approveMutation.error)) {
        toast.error(err instanceof Error ? err.message : "Failed to approve expense");
      }
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
      if (changes && Object.keys(changes).length > 0) {
        await updateMutation.mutateAsync({ id, data: changes });
      }
      await resubmitMutation.mutateAsync({ id });
      router.push("/transactions?tab=pending");
    } catch (err) {
      if (!(err instanceof Error && resubmitMutation.error)) {
        toast.error(err instanceof Error ? err.message : "Failed to re-submit expense");
      }
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

  const isPending = (expense as unknown as PendingExpenseData).status === "PENDING";
  const isRejected = (expense as unknown as PendingExpenseData).status === "REJECTED";
  const anyLoading =
    isSaving || approveMutation.isPending || rejectMutation.isPending ||
    resubmitMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <div className="space-y-6 dash-animate-in">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()} className="text-text-secondary">
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline ml-2">Back to Transactions</span>
        </Button>
        <div className="flex items-center gap-2">
          {isPending && (
            <>
              <Button
                onClick={() => actionsRef.current?.handleApprove()}
                loading={isSaving || approveMutation.isPending}
                disabled={anyLoading && !(isSaving || approveMutation.isPending)}
              >
                <Check className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">
                  {hasChanges ? "Save & Approve" : "Approve"}
                </span>
              </Button>
              <Button
                variant="outline"
                className="border-expense/30 text-expense hover:bg-expense/5 hover:border-expense/50"
                onClick={() => setShowRejectDialog(true)}
                disabled={anyLoading}
              >
                <X className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Reject</span>
              </Button>
            </>
          )}
          {isRejected && (
            <Button
              onClick={() => actionsRef.current?.handleResubmit()}
              loading={isSaving || resubmitMutation.isPending}
              disabled={anyLoading && !(isSaving || resubmitMutation.isPending)}
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">
                {hasChanges ? "Save & Re-submit" : "Re-submit"}
              </span>
            </Button>
          )}
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
            <AlertDialogTitle>Delete this transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this transaction.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <RejectDialog
        open={showRejectDialog}
        onOpenChange={setShowRejectDialog}
        onConfirm={(reason) => {
          handleReject(reason);
          setShowRejectDialog(false);
        }}
        isLoading={rejectMutation.isPending}
      />

      <PendingTransactionDetail
        key={resetKey}
        expense={expense as unknown as PendingExpenseData}
        onApprove={handleApprove}
        onResubmit={handleResubmit}
        onUpdate={handleUpdate}
        onActionsReady={handleActionsReady}
        isApproving={isSaving || approveMutation.isPending}
        isRejecting={rejectMutation.isPending}
        isResubmitting={isSaving || resubmitMutation.isPending}
        isUpdating={isSaving || updateMutation.isPending}
      />
    </div>
  );
}
