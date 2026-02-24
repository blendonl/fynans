"use client";

import { useState } from "react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useManageItemCategories } from "@/hooks/use-manage-categories";
import { ManageListContainer } from "./manage-list-container";
import { ManageEntityRow } from "./manage-entity-row";

export function ItemCategoriesTab() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const { categories, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useManageItemCategories(debouncedSearch);

  return (
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
  );
}
