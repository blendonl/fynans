import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { BasketItem } from "@/types";
import {
  basketControllerAddItem,
  basketControllerUpdateItem,
  basketControllerRemoveItem,
  basketControllerCheckout,
} from "@/api/generated/endpoints/basket/basket";

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
      const res = await basketControllerAddItem(basketId, data);
      return res.data;
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
      const res = await basketControllerUpdateItem(itemId, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["baskets"] });
    },
  });

  const removeItem = useMutation({
    mutationFn: async (itemId: string) => {
      await basketControllerRemoveItem(itemId);
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
      const res = await basketControllerCheckout(basketId, {
        itemIds: data.itemIds,
        categoryId: data.categoryId,
        storeId: data.storeId,
        itemOverrides: data.itemOverrides,
        recordedAt: data.recordedAt,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["baskets"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });

  return { addItem, updateItem, removeItem, checkout };
}
