"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useManageItems, useCreateItem } from "@/hooks/use-manage-items";
import { ManageListContainer } from "./manage-list-container";
import { ManageEntityRow } from "./manage-entity-row";
import { CreateItemDialog } from "./create-item-dialog";
import { Button } from "@/components/ui/button";

export function ItemsTab() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(search, 300);
  const { items, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useManageItems(debouncedSearch);
  const createItem = useCreateItem();

  const handleCreate = async (name: string, categoryId: string) => {
    try {
      const result = await createItem.mutateAsync({ name, categoryId });
      setDialogOpen(false);
      router.push(`/manage/items/${result.id}`);
    } catch {
      // handled by onError toast
    }
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          New Item
        </Button>
      </div>
      <ManageListContainer
        entity="items"
        search={search}
        onSearchChange={setSearch}
        isLoading={isLoading}
        isEmpty={items.length === 0}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
      >
        {items.map((item) => (
          <ManageEntityRow
            key={item.id}
            href={`/manage/items/${item.id}`}
            title={item.name}
          />
        ))}
      </ManageListContainer>
      <CreateItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreate}
        isLoading={createItem.isPending}
      />
    </>
  );
}
