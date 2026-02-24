"use client";

import { useState } from "react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useManageExpenseCategories } from "@/hooks/use-manage-categories";
import { ManageListContainer } from "./manage-list-container";
import { ManageEntityRow } from "./manage-entity-row";

export function ExpenseCategoriesTab() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const { categories, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useManageExpenseCategories(debouncedSearch);

  return (
    <ManageListContainer
      entity="expense categories"
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
          href={`/manage/expense-categories/${cat.id}`}
          title={cat.name}
          badge={cat.isConnectedToStore ? "Store-linked" : undefined}
        />
      ))}
    </ManageListContainer>
  );
}
