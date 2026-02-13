"use client";

import { useMemo } from "react";
import type { Category } from "@fynans/shared";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";

interface CategorySelectorProps {
  categories: Category[];
  selectedCategory: Category | null;
  onSelect: (category: Category) => void;
  onClear: () => void;
  onSearch: (query: string) => void;
  onCreateNew: (name: string) => void;
  isLoading: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

export function CategorySelector({
  categories,
  selectedCategory,
  onSelect,
  onClear,
  onSearch,
  onCreateNew,
  isLoading,
  onLoadMore,
  hasMore,
  isLoadingMore,
}: CategorySelectorProps) {
  const options: ComboboxOption[] = useMemo(
    () =>
      categories.map((cat) => ({
        value: cat.id,
        label: cat.name,
        sublabel: cat.isConnectedToStore ? "(store)" : undefined,
      })),
    [categories]
  );

  return (
    <div className="space-y-2">
      <Label>Category</Label>
      <Combobox
        options={options}
        value={selectedCategory?.id ?? null}
        displayValue={selectedCategory?.name}
        onChange={(id) => {
          const cat = categories.find((c) => c.id === id);
          if (cat) onSelect(cat);
        }}
        onClear={onClear}
        onSearchChange={onSearch}
        onCreateNew={onCreateNew}
        onLoadMore={onLoadMore}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        placeholder="Type or select a category"
        isLoading={isLoading}
      />
    </div>
  );
}
