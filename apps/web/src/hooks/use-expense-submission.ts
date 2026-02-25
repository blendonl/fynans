import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/currency";
import type { Category, Store, ExpenseItem } from "@/types";
import { expenseControllerCreate, expenseControllerUpdatePending } from "@/api/generated/endpoints/expense/expense";
import { customInstance } from "@/api/custom-instance";

interface SubmitArgs {
  isItemized: boolean;
  items: ExpenseItem[];
  itemsTotal: number;
  selectedCategory: Category | null;
  selectedStore: Store | null;
  simpleAmount: string;
  simpleNote: string;
  recordedAt: string;
  scope: "PERSONAL" | "FAMILY";
  familyId: string;
  paymentMethodId: string | null;
  pendingIdToCleanup?: string | null;
  receiptIdToLink?: string | null;
}

interface UseExpenseSubmissionOptions {
  onSuccess: () => void;
  onSaveForReview?: () => void;
  onCleanupPending?: () => void;
}

function buildPayload({
  isItemized,
  items,
  selectedCategory,
  selectedStore,
  simpleAmount,
  simpleNote,
  recordedAt,
  scope,
  familyId,
  paymentMethodId,
  pending,
}: {
  isItemized: boolean;
  items: ExpenseItem[];
  selectedCategory: Category | null;
  selectedStore: Store | null;
  simpleAmount: string;
  simpleNote: string;
  recordedAt: string;
  scope: string;
  familyId: string;
  paymentMethodId: string | null;
  pending?: boolean;
}) {
  const payload: Record<string, unknown> = {
    categoryId: selectedCategory?.id,
    storeName: selectedStore?.name,
    storeLocation: selectedStore?.location,
    recordedAt: new Date(recordedAt).toISOString(),
    scope,
    familyId: scope === "FAMILY" ? familyId : null,
    paymentMethodId: paymentMethodId || undefined,
  };

  if (pending) payload.pending = true;

  if (isItemized) {
    payload.items = items.map((item) => ({
      categoryId: item.categoryId,
      itemName: item.name,
      itemPrice: item.price,
      discount: item.discount,
      quantity: item.quantity,
      ...(item.size ? { sizeValue: item.size.value, sizeUnit: item.size.unit } : {}),
    }));
  } else {
    payload.amount = parseFloat(simpleAmount);
    payload.note = simpleNote.trim() || undefined;
  }

  return payload;
}

export function canSubmit(state: Pick<SubmitArgs, "selectedCategory" | "isItemized" | "selectedStore" | "items" | "simpleAmount">) {
  if (!state.selectedCategory) return false;
  if (state.isItemized) {
    if (!state.selectedStore) return false;
    return state.items.length > 0;
  }
  return state.simpleAmount !== "" && parseFloat(state.simpleAmount) > 0;
}

export function canSaveForReview(state: Pick<SubmitArgs, "isItemized" | "items" | "simpleAmount">) {
  if (state.isItemized) return state.items.length > 0;
  return state.simpleAmount !== "" && parseFloat(state.simpleAmount) > 0;
}

export function getValidationMessage(state: Pick<SubmitArgs, "isItemized" | "selectedStore" | "items" | "simpleAmount" | "selectedCategory">) {
  if (!state.isItemized && (!state.simpleAmount || parseFloat(state.simpleAmount) <= 0)) return "Enter an amount";
  if (state.isItemized && !state.selectedStore) return "Select a store to continue";
  if (state.isItemized && state.items.length === 0) return "Add at least one item";
  if (!state.selectedCategory) return "Category will be auto-assigned";
  return null;
}

export function useExpenseSubmission({
  onSuccess,
  onSaveForReview,
  onCleanupPending,
}: UseExpenseSubmissionOptions) {
  const submitMutation = useMutation({
    mutationFn: async (args: SubmitArgs) => {
      const payload = buildPayload({
        isItemized: args.isItemized,
        items: args.items,
        selectedCategory: args.selectedCategory,
        selectedStore: args.selectedStore,
        simpleAmount: args.simpleAmount,
        simpleNote: args.simpleNote,
        recordedAt: args.recordedAt,
        scope: args.scope,
        familyId: args.familyId,
        paymentMethodId: args.paymentMethodId,
      });
      const res = await expenseControllerCreate(payload as unknown as Parameters<typeof expenseControllerCreate>[0]);

      if (args.receiptIdToLink) {
        const newExpenseId = (res as unknown as { data: { id: string } }).data?.id;
        if (newExpenseId) {
          try {
            await customInstance(`/receipts/${args.receiptIdToLink}/link-expense`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ expenseId: newExpenseId }),
            });
          } catch {
            toast.warning("Expense created but receipt linking failed");
          }
        }
      }

      if (args.pendingIdToCleanup) {
        try {
          await customInstance(`/expenses/${args.pendingIdToCleanup}`, { method: "DELETE" });
          onCleanupPending?.();
        } catch {
          toast.warning("Expense created but pending cleanup failed");
        }
      }

      return args;
    },
    onSuccess: (args) => {
      const total = args.isItemized ? args.itemsTotal : parseFloat(args.simpleAmount);
      toast.success(`Expense created: ${formatCurrency(total)}`);
      onSuccess();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create expense");
    },
  });

  const saveForReviewMutation = useMutation({
    mutationFn: async (args: SubmitArgs) => {
      if (args.pendingIdToCleanup) {
        await expenseControllerUpdatePending(args.pendingIdToCleanup, {
          categoryId: args.selectedCategory?.id,
          storeId: args.selectedStore?.id ?? null,
          amount: args.isItemized ? args.itemsTotal : parseFloat(args.simpleAmount),
          recordedAt: new Date(args.recordedAt).toISOString(),
          paymentMethodId: args.paymentMethodId ?? null,
        });
        return args;
      }

      const payload = buildPayload({
        isItemized: args.isItemized,
        items: args.items,
        selectedCategory: args.selectedCategory,
        selectedStore: args.selectedStore,
        simpleAmount: args.simpleAmount,
        simpleNote: args.simpleNote,
        recordedAt: args.recordedAt,
        scope: args.scope,
        familyId: args.familyId,
        paymentMethodId: args.paymentMethodId,
        pending: true,
      });
      await expenseControllerCreate(payload as unknown as Parameters<typeof expenseControllerCreate>[0]);
      return args;
    },
    onSuccess: (args) => {
      const total = args.isItemized ? args.itemsTotal : parseFloat(args.simpleAmount);
      toast.success(`Expense saved for review: ${formatCurrency(total)}`);
      onSaveForReview?.();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save expense for review");
    },
  });

  return { submitMutation, saveForReviewMutation, canSubmit, canSaveForReview, getValidationMessage };
}
