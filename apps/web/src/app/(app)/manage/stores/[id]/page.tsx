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
import { nestedStoreItemControllerFindAll } from "@/api/generated/endpoints/store-item/store-item";
import { storeItemControllerDelete } from "@/api/generated/endpoints/store-item/store-item";
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
      queryClient.invalidateQueries({
        queryKey: queryKeys.storeItems.forStore(id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.storeItems.all });
      toast.success("Item removed from store");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove item");
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
      />
    </div>
  );
}
