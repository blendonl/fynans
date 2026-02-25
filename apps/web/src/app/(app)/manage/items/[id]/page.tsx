"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
  itemControllerFindOne,
  itemControllerUpdate,
  itemControllerDelete,
} from "@/api/generated/endpoints/items/items";
import { storeItemCategoryControllerFindAll, storeItemCategoryControllerCreate } from "@/api/generated/endpoints/store-item-category/store-item-category";
import { storeItemControllerCreate, storeItemControllerDelete, storeItemControllerUpdate } from "@/api/generated/endpoints/store-item/store-item";
import { storeControllerFindAll, storeControllerCreate } from "@/api/generated/endpoints/store/store";
import { storeItemDiscountControllerCreate, storeItemDiscountControllerEnd, storeItemDiscountControllerGetActive } from "@/api/generated/endpoints/store-item-discount/store-item-discount";
import { Button } from "@/components/ui/button";
import { ItemDetail } from "@/components/manage/item-detail";
import { queryKeys } from "@/lib/query-keys";

export default function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: item, isLoading } = useQuery({
    queryKey: ["item", id],
    queryFn: async () => {
      const res = await itemControllerFindOne(id);
      return res.data;
    },
  });

  const { data: categoriesRes } = useQuery({
    queryKey: queryKeys.categories.item(),
    queryFn: async () => {
      const res = await storeItemCategoryControllerFindAll({
        limit: 200,
      } as Parameters<typeof storeItemCategoryControllerFindAll>[0]);
      return res.data;
    },
  });

  const { data: storesRes } = useQuery({
    queryKey: queryKeys.stores.all,
    queryFn: async () => {
      const res = await storeControllerFindAll({ limit: 200 });
      return res.data;
    },
  });

  const itemCategories = categoriesRes?.data ?? [];
  const storesList = (storesRes?.data ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    location: s.location,
  }));

  const storeItemIds = item?.stores.map((s) => s.storeItemId) ?? [];

  const discountQueries = useQuery({
    queryKey: ["item-discounts", id, storeItemIds],
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

  const invalidateItem = () => {
    queryClient.invalidateQueries({ queryKey: ["item", id] });
    queryClient.invalidateQueries({ queryKey: ["items"] });
  };

  const updateMutation = useMutation({
    mutationFn: async (data: { name: string; categoryId: string }) => {
      await itemControllerUpdate(id, data);
    },
    onSuccess: () => {
      invalidateItem();
      toast.success("Item updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update item");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await itemControllerDelete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      toast.success("Item deleted");
      router.push("/manage");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete item");
    },
  });

  const deleteStoreItemMutation = useMutation({
    mutationFn: async (storeItemId: string) => {
      await storeItemControllerDelete(storeItemId);
    },
    onSuccess: () => {
      invalidateItem();
      queryClient.invalidateQueries({ queryKey: queryKeys.storeItems.all });
      toast.success("Store link removed");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove store link");
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await storeItemCategoryControllerCreate({ name });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.item() });
      toast.success("Category created");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create category");
    },
  });

  const createStoreLinkMutation = useMutation({
    mutationFn: async ({ storeId, price }: { storeId: string; price: number }) => {
      if (!item) throw new Error("Item not loaded");
      await storeItemControllerCreate({
        storeId,
        name: item.name,
        price,
        categoryId: item.categoryId,
      });
    },
    onSuccess: () => {
      invalidateItem();
      queryClient.invalidateQueries({ queryKey: queryKeys.storeItems.all });
      toast.success("Store link created");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to link store");
    },
  });

  const createStoreMutation = useMutation({
    mutationFn: async ({ name, location }: { name: string; location: string }) => {
      const res = await storeControllerCreate({ name, location });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stores.all });
      toast.success("Store created");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create store");
    },
  });

  const updateStoreItemMutation = useMutation({
    mutationFn: async ({ storeItemId, data }: { storeItemId: string; data: { price?: number; isDiscounted?: boolean } }) => {
      await storeItemControllerUpdate(storeItemId, data);
    },
    onSuccess: () => {
      invalidateItem();
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
      invalidateItem();
      queryClient.invalidateQueries({ queryKey: ["item-discounts", id] });
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
      invalidateItem();
      queryClient.invalidateQueries({ queryKey: ["item-discounts", id] });
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

  if (!item) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Item not found</p>
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
      <ItemDetail
        item={item}
        itemCategories={itemCategories}
        stores={storesList}
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
        onCreateCategory={(name) => createCategoryMutation.mutate(name)}
        isCreatingCategory={createCategoryMutation.isPending}
        onCreateStoreLink={(storeId, price) =>
          createStoreLinkMutation.mutate({ storeId, price })
        }
        isCreatingStoreLink={createStoreLinkMutation.isPending}
        onCreateStore={(name, location) =>
          createStoreMutation.mutate({ name, location })
        }
        isCreatingStore={createStoreMutation.isPending}
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
