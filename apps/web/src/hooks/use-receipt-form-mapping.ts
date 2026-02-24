import { useCallback } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { QueryClient } from "@tanstack/react-query";
import type { Category, Store, ExpenseItem } from "@/types";
import type { ProcessedReceiptResponse } from "@/hooks/use-receipt-scan";

interface UseReceiptFormMappingOptions {
  selectedCategory: Category | null;
  setSelectedCategory: (cat: Category | null) => void;
  setSelectedStore: (store: Store | null) => void;
  setRecordedAt: (val: string) => void;
  setIsItemized: (val: boolean) => void;
  setHasScannedReceipt: (val: boolean) => void;
  setItems: (items: ExpenseItem[]) => void;
  queryClient: QueryClient;
  onPendingCreated?: (pendingExpenseId: string) => void;
}

export function useReceiptFormMapping({
  selectedCategory,
  setSelectedCategory,
  setSelectedStore,
  setRecordedAt,
  setIsItemized,
  setHasScannedReceipt,
  setItems,
  queryClient,
  onPendingCreated,
}: UseReceiptFormMappingOptions) {
  const handleReceiptResult = useCallback(
    (data: ProcessedReceiptResponse) => {
      if (!data.items || data.items.length === 0) {
        toast.warning("No items found in receipt");
        return;
      }

      if (data.isLowConfidence) {
        toast.warning("Low confidence scan -- please review items carefully");
      }

      setIsItemized(true);
      setHasScannedReceipt(true);

      // Auto-select expense category from receipt AI suggestion
      let autoSelectedCategory = selectedCategory;
      if (data.suggestedExpenseCategory && !selectedCategory) {
        autoSelectedCategory = {
          id: data.suggestedExpenseCategory.id,
          name: data.suggestedExpenseCategory.name,
        } as Category;
        setSelectedCategory(autoSelectedCategory);
        toast.info(`Category auto-selected: ${data.suggestedExpenseCategory.name}`);
        queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
        queryClient.invalidateQueries({ queryKey: ["expense-item-categories"] });
      }

      if (data.store?.id) {
        setSelectedStore({ id: data.store.id, name: data.store.name, location: data.store.location } as Store);
        queryClient.invalidateQueries({ queryKey: ["stores"] });
      }

      const fallbackCategoryId = autoSelectedCategory?.id || selectedCategory?.id || "";
      setItems(
        data.items.map((item) => ({
          id: crypto.randomUUID(),
          name: item.name,
          price: item.price,
          discount: 0,
          quantity: item.quantity,
          categoryId: item.resolvedCategoryId || fallbackCategoryId,
          fromReceipt: true,
          size: item.size,
        })),
      );

      if (data.recordedAt) {
        const parsed = new Date(data.recordedAt);
        if (!isNaN(parsed.getTime())) {
          setRecordedAt(format(parsed, "yyyy-MM-dd'T'HH:mm"));
        }
      }

      const storeName = data.store?.name;
      toast.success(
        `Found ${data.items.length} item${data.items.length !== 1 ? "s" : ""}${storeName ? ` from ${storeName}` : ""}`,
      );

      if (data.pendingExpenseId) {
        onPendingCreated?.(data.pendingExpenseId);
        toast.info("Receipt saved to pending for review", {
          action: {
            label: "Review",
            onClick: () => {
              window.location.href = `/transactions?tab=pending`;
            },
          },
        });
      }
    },
    [selectedCategory, setSelectedCategory, setSelectedStore, setRecordedAt, setIsItemized, setHasScannedReceipt, setItems, queryClient, onPendingCreated],
  );

  return { handleReceiptResult };
}
