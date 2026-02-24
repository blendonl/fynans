"use client";

import { useState } from "react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useManageStores } from "@/hooks/use-manage-stores";
import { ManageListContainer } from "./manage-list-container";
import { ManageEntityRow } from "./manage-entity-row";

export function StoresTab() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const { stores, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useManageStores(debouncedSearch);

  return (
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
  );
}
