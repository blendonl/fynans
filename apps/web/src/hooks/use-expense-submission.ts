import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/currency";
import type { Category, Store, ExpenseItem } from "@/types";
import { apiClient } from "@/lib/api-client";

interface UseExpenseSubmissionOptions {
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
  onSuccess: () => void;
}

export function useExpenseSubmission({
  isItemized,
  items,
  itemsTotal,
  selectedCategory,
  selectedStore,
  simpleAmount,
  simpleNote,
  recordedAt,
  scope,
  familyId,
  paymentMethodId,
  onSuccess,
}: UseExpenseSubmissionOptions) {
  const submitMutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = {
        categoryId: selectedCategory!.id,
        storeName: selectedStore?.name,
        storeLocation: selectedStore?.location,
        recordedAt: new Date(recordedAt).toISOString(),
        scope,
        familyId: scope === "FAMILY" ? familyId : null,
        paymentMethodId: paymentMethodId || undefined,
      };

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

      await apiClient.post("/expenses", payload);
    },
    onSuccess: () => {
      const total = isItemized ? itemsTotal : parseFloat(simpleAmount);
      toast.success(`Expense created: ${formatCurrency(total)}`);
      onSuccess();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create expense");
    },
  });

  const canSubmit = () => {
    if (!selectedCategory) return false;
    if (isItemized) {
      if (!selectedStore) return false;
      return items.length > 0;
    }
    return simpleAmount !== "" && parseFloat(simpleAmount) > 0;
  };

  const validationMessage = () => {
    if (!isItemized && (!simpleAmount || parseFloat(simpleAmount) <= 0)) return "Enter an amount";
    if (isItemized && !selectedStore) return "Select a store to continue";
    if (isItemized && items.length === 0) return "Add at least one item";
    if (!selectedCategory) return "Category will be auto-assigned";
    return null;
  };

  return { submitMutation, canSubmit, validationMessage };
}
