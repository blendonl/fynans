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
} from "@/api/generated/endpoints/store-item-category/store-item-category";
import { Button } from "@/components/ui/button";
import { CategoryDetail } from "@/components/manage/category-detail";

export default function ItemCategoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
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

  const updateMutation = useMutation({
    mutationFn: async (data: { name?: string }) => {
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
      <Button variant="ghost" onClick={() => router.back()} className="text-text-secondary">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Manage
      </Button>
      <CategoryDetail
        category={category}
        entityType="item"
        onUpdate={(data) => updateMutation.mutate(data)}
        isUpdating={updateMutation.isPending}
        onDelete={() => deleteMutation.mutate()}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
