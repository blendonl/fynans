"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
  storeItemCategoryControllerFindOne,
  storeItemCategoryControllerUpdate,
  storeItemCategoryControllerRemove,
  storeItemCategoryControllerFindAll,
} from "@/api/generated/endpoints/store-item-category/store-item-category";
import { itemControllerFindAll } from "@/api/generated/endpoints/items/items";
import { itemControllerUpdate } from "@/api/generated/endpoints/items/items";
import { Button } from "@/components/ui/button";
import { CategoryDetail } from "@/components/manage/category-detail";
import { queryKeys } from "@/lib/query-keys";

export default function ItemCategoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: category, isLoading } = useQuery({
    queryKey: ["item-category", id],
    queryFn: async () => {
      const res = await storeItemCategoryControllerFindOne(id);
      return res.data;
    },
  });

  const { data: allCategoriesRes } = useQuery({
    queryKey: queryKeys.categories.item(),
    queryFn: async () => {
      const res = await storeItemCategoryControllerFindAll({
        limit: 200,
      } as unknown as Parameters<typeof storeItemCategoryControllerFindAll>[0]);
      return res.data;
    },
  });

  const allCategories = (allCategoriesRes?.data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
  }));

  const { data: itemsRes, isLoading: isLoadingItems } = useQuery({
    queryKey: queryKeys.items.byCategory(id),
    queryFn: async () => {
      const res = await itemControllerFindAll({
        categoryId: id,
        limit: 200,
      } as Parameters<typeof itemControllerFindAll>[0]);
      return res.data;
    },
  });

  const categoryItems = (itemsRes?.data ?? []).map((i) => ({
    id: i.id,
    name: i.name,
  }));

  const updateMutation = useMutation({
    mutationFn: async (data: { name?: string; parentId?: string | null }) => {
      await storeItemCategoryControllerUpdate(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["item-category", id] });
      queryClient.invalidateQueries({ queryKey: ["expense-item-categories"] });
      toast.success("Category updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update category");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await storeItemCategoryControllerRemove(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-item-categories"] });
      toast.success("Category deleted");
      router.push("/manage");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete category");
    },
  });

  const reassignMutation = useMutation({
    mutationFn: async ({
      itemId,
      newCategoryId,
    }: {
      itemId: string;
      newCategoryId: string;
    }) => {
      await itemControllerUpdate(itemId, { categoryId: newCategoryId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.items.byCategory(id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.items.all });
      toast.success("Item moved");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to move item");
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

  if (!category) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Category not found</p>
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
      <CategoryDetail
        category={category}
        entityType="item"
        allCategories={allCategories}
        categoryItems={categoryItems}
        isLoadingItems={isLoadingItems}
        onUpdate={(data) => updateMutation.mutate(data)}
        isUpdating={updateMutation.isPending}
        onReassignItem={(itemId, newCategoryId) =>
          reassignMutation.mutate({ itemId, newCategoryId })
        }
        isReassigning={reassignMutation.isPending}
        onDelete={() => deleteMutation.mutate()}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
