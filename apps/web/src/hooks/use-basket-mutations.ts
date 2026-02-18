import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { BasketItem } from "@fynans/shared";

export function useBasketMutations(basketId: string | null) {
  const queryClient = useQueryClient();

  const addItem = useMutation({
    mutationFn: async (data: {
      name: string;
      quantity?: number;
      price?: number;
      categoryId?: string;
      notes?: string;
    }) => {
      if (!basketId) throw new Error("No active basket");
      return (await apiClient.post(
        `/baskets/${basketId}/items`,
        data,
      )) as BasketItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["baskets"] });
    },
  });

  const updateItem = useMutation({
    mutationFn: async ({
      itemId,
      ...data
    }: {
      itemId: string;
      name?: string;
      quantity?: number;
      price?: number | null;
      categoryId?: string | null;
      notes?: string | null;
    }) => {
      return (await apiClient.put(
        `/baskets/items/${itemId}`,
        data,
      )) as BasketItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["baskets"] });
    },
  });

  const removeItem = useMutation({
    mutationFn: async (itemId: string) => {
      await apiClient.delete(`/baskets/items/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["baskets"] });
    },
  });

  const checkout = useMutation({
    mutationFn: async (data: {
      itemIds: string[];
      categoryId: string;
      storeId?: string;
      itemOverrides?: Array<{ id: string; price?: number; quantity?: number; categoryId?: string }>;
      recordedAt?: string;
    }) => {
      if (!basketId) throw new Error("No active basket");
      return (await apiClient.post(`/baskets/${basketId}/checkout`, {
        itemIds: data.itemIds,
        categoryId: data.categoryId,
        storeId: data.storeId,
        itemOverrides: data.itemOverrides,
        recordedAt: data.recordedAt,
      })) as { expenseId: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["baskets"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });

  return { addItem, updateItem, removeItem, checkout };
}
