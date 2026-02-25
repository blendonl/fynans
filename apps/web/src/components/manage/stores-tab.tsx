"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useStoresList, useCreateStore } from "@/hooks/use-stores";
import { ManageListContainer } from "./manage-list-container";
import { ManageEntityRow } from "./manage-entity-row";
import { CreateStoreDialog } from "./create-store-dialog";
import { Button } from "@/components/ui/button";

export function StoresTab() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(search, 300);
  const { stores, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useStoresList(debouncedSearch);
  const createStore = useCreateStore();

  const handleCreate = async (name: string, location: string) => {
    try {
      const result = await createStore.mutateAsync({ name, location });
      setDialogOpen(false);
      router.push(`/manage/stores/${result.id}`);
    } catch {
      // handled by onError toast
    }
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          New Store
        </Button>
      </div>
      <ManageListContainer
        entity="stores"
        search={search}
        onSearchChange={setSearch}
        isLoading={isLoading}
        isEmpty={stores.length === 0}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
      >
        {stores.map((store) => (
          <ManageEntityRow
            key={store.id}
            href={`/manage/stores/${store.id}`}
            title={store.name}
            subtitle={store.location}
          />
        ))}
      </ManageListContainer>
      <CreateStoreDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreate}
        isLoading={createStore.isPending}
      />
    </>
  );
}
