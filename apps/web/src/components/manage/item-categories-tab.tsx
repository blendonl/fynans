"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useManageItemCategories, useCreateItemCategory } from "@/hooks/use-manage-categories";
import { ManageListContainer } from "./manage-list-container";
import { ManageEntityRow } from "./manage-entity-row";
import { CreateCategoryDialog } from "./create-category-dialog";
import { Button } from "@/components/ui/button";

export function ItemCategoriesTab() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(search, 300);
  const { categories, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useManageItemCategories(debouncedSearch);
  const createCategory = useCreateItemCategory();

  const handleCreate = async (data: { name: string }) => {
    try {
      const result = await createCategory.mutateAsync({ name: data.name });
      setDialogOpen(false);
      router.push(`/manage/item-categories/${result.id}`);
    } catch {
      // handled by onError toast
    }
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          New Category
        </Button>
      </div>
      <ManageListContainer
        entity="item categories"
        search={search}
        onSearchChange={setSearch}
        isLoading={isLoading}
        isEmpty={categories.length === 0}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
      >
        {categories.map((cat) => (
          <ManageEntityRow
            key={cat.id}
            href={`/manage/item-categories/${cat.id}`}
            title={cat.name}
          />
        ))}
      </ManageListContainer>
      <CreateCategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        categoryType="item"
        onSubmit={handleCreate}
        isLoading={createCategory.isPending}
      />
    </>
  );
}
