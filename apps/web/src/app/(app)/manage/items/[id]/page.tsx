"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { itemControllerFindOne, itemControllerUpdate, itemControllerDelete } from "@/api/generated/endpoints/items/items";
import { Button } from "@/components/ui/button";
import { ItemDetail } from "@/components/manage/item-detail";

export default function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
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

  const updateMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      await itemControllerUpdate(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["item", id] });
      queryClient.invalidateQueries({ queryKey: ["items"] });
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
      <Button variant="ghost" onClick={() => router.back()} className="text-text-secondary">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Manage
      </Button>
      <ItemDetail
        item={item}
        onUpdate={(data) => updateMutation.mutate(data)}
        isUpdating={updateMutation.isPending}
        onDelete={() => deleteMutation.mutate()}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
