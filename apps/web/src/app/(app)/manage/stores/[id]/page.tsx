"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
  storeControllerFindOne,
  storeControllerUpdate,
  storeControllerDelete,
} from "@/api/generated/endpoints/store/store";
import { nestedStoreItemControllerFindAll, storeItemControllerDelete, storeItemControllerUpdate } from "@/api/generated/endpoints/store-item/store-item";
import { storeItemDiscountControllerCreate, storeItemDiscountControllerEnd, storeItemDiscountControllerGetActive } from "@/api/generated/endpoints/store-item-discount/store-item-discount";
import { Button } from "@/components/ui/button";
import { StoreDetail } from "@/components/manage/store-detail";
import { queryKeys } from "@/lib/query-keys";

export default function StoreDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: store, isLoading } = useQuery({
    queryKey: ["store", id],
    queryFn: async () => {
      const res = await storeControllerFindOne(id);
      return res.data;
    },
  });

  const { data: storeItemsRes, isLoading: isLoadingItems } = useQuery({
    queryKey: queryKeys.storeItems.forStore(id),
    queryFn: async () => {
      const res = await nestedStoreItemControllerFindAll(id, { limit: 200 });
      return res.data;
    },
  });

  const storeItems = storeItemsRes?.data ?? [];
  const storeItemIds = storeItems.map((si) => si.id);

  const discountQueries = useQuery({
    queryKey: ["store-discounts", id, storeItemIds],
    queryFn: async () => {
      const results: Record<string, { id: string; discount: number }> = {};
      await Promise.all(
        storeItemIds.map(async (storeItemId) => {
          try {
            const res = await storeItemDiscountControllerGetActive(storeItemId);
            if (res.data?.isActive) {
              results[storeItemId] = {
                id: res.data.id,
                discount: res.data.discount,
              };
            }
          } catch {
            // no active discount
          }
        })
      );
      return results;
    },
    enabled: storeItemIds.length > 0,
  });

  const activeDiscounts = discountQueries.data ?? {};

  const invalidateStoreItems = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.storeItems.forStore(id) });
    queryClient.invalidateQueries({ queryKey: queryKeys.storeItems.all });
  };

  const updateMutation = useMutation({
    mutationFn: async (data: { name?: string; location?: string }) => {
      await storeControllerUpdate(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store", id] });
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      toast.success("Store updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update store");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await storeControllerDelete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      toast.success("Store deleted");
      router.push("/manage");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete store");
    },
  });

  const deleteStoreItemMutation = useMutation({
    mutationFn: async (storeItemId: string) => {
      await storeItemControllerDelete(storeItemId);
    },
    onSuccess: () => {
      invalidateStoreItems();
      toast.success("Item removed from store");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove item");
    },
  });

  const updateStoreItemMutation = useMutation({
    mutationFn: async ({ storeItemId, data }: { storeItemId: string; data: { price?: number; isDiscounted?: boolean } }) => {
      await storeItemControllerUpdate(storeItemId, data);
    },
    onSuccess: () => {
      invalidateStoreItems();
      toast.success("Store item updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update store item");
    },
  });

  const createDiscountMutation = useMutation({
    mutationFn: async ({ storeItemId, discount }: { storeItemId: string; discount: number }) => {
      await storeItemDiscountControllerCreate(storeItemId, { discount });
      await storeItemControllerUpdate(storeItemId, { isDiscounted: true });
    },
    onSuccess: () => {
      invalidateStoreItems();
      queryClient.invalidateQueries({ queryKey: ["store-discounts", id] });
      toast.success("Discount added");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add discount");
    },
  });

  const endDiscountMutation = useMutation({
    mutationFn: async ({ storeItemId, discountId }: { storeItemId: string; discountId: string }) => {
      await storeItemDiscountControllerEnd(storeItemId, discountId);
      await storeItemControllerUpdate(storeItemId, { isDiscounted: false });
    },
    onSuccess: () => {
      invalidateStoreItems();
      queryClient.invalidateQueries({ queryKey: ["store-discounts", id] });
      toast.success("Discount ended");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to end discount");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 rounded-md bg-surface-variant skeleton-shimmer" />
        <div className="h-56 rounded-2xl bg-surface-variant/30 skeleton-shimmer" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Store not found</p>
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
        Back to Manage
      </Button>
      <StoreDetail
        store={store}
        storeItems={storeItems}
        isLoadingItems={isLoadingItems}
        onUpdate={(data) => updateMutation.mutate(data)}
        isUpdating={updateMutation.isPending}
        onDelete={() => deleteMutation.mutate()}
        isDeleting={deleteMutation.isPending}
        onDeleteStoreItem={(storeItemId) =>
          deleteStoreItemMutation.mutate(storeItemId)
        }
        deletingStoreItemId={
          deleteStoreItemMutation.isPending
            ? (deleteStoreItemMutation.variables as string)
            : null
        }
        onUpdateStoreItem={(storeItemId, data) =>
          updateStoreItemMutation.mutate({ storeItemId, data })
        }
        isUpdatingStoreItem={updateStoreItemMutation.isPending}
        onCreateDiscount={(storeItemId, discount) =>
          createDiscountMutation.mutate({ storeItemId, discount })
        }
        isCreatingDiscount={createDiscountMutation.isPending}
        onEndDiscount={(storeItemId, discountId) =>
          endDiscountMutation.mutate({ storeItemId, discountId })
        }
        isEndingDiscount={endDiscountMutation.isPending}
        activeDiscounts={activeDiscounts}
      />
    </div>
  );
}
