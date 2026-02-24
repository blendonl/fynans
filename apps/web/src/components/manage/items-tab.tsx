"use client";

import { useState } from "react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useManageItems } from "@/hooks/use-manage-items";
import { ManageListContainer } from "./manage-list-container";
import { ManageEntityRow } from "./manage-entity-row";

export function ItemsTab() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const { items, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useManageItems(debouncedSearch);

  return (
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
  );
}
