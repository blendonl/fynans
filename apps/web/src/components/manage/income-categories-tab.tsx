"use client";

import { useState } from "react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useManageIncomeCategories } from "@/hooks/use-manage-categories";
import { ManageListContainer } from "./manage-list-container";
import { ManageEntityRow } from "./manage-entity-row";

export function IncomeCategoriesTab() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const { categories, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useManageIncomeCategories(debouncedSearch);

  return (
    <ManageListContainer
      entity="income categories"
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
          href={`/manage/income-categories/${cat.id}`}
          title={cat.name}
        />
      ))}
    </ManageListContainer>
  );
}
