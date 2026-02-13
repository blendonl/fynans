"use client";

import { useMemo } from "react";
import type { Category } from "@fynans/shared";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";

interface ItemCategorySelectorProps {
  itemCategories: Category[];
  selectedCategory: Category | null;
  onSelect: (category: Category) => void;
  onClear: () => void;
  onCreateNew: (name: string) => void;
  isLoading: boolean;
}

export function ItemCategorySelector({
  itemCategories,
  selectedCategory,
  onSelect,
  onClear,
  onCreateNew,
  isLoading,
}: ItemCategorySelectorProps) {
  const options: ComboboxOption[] = useMemo(
    () =>
      itemCategories.map((cat) => ({
        value: cat.id,
        label: cat.name,
      })),
    [itemCategories]
  );

  return (
    <Combobox
      options={options}
      value={selectedCategory?.id ?? null}
      displayValue={selectedCategory?.name}
      onChange={(id) => {
        const cat = itemCategories.find((c) => c.id === id);
        if (cat) onSelect(cat);
      }}
      onClear={onClear}
      onCreateNew={onCreateNew}
      placeholder="Item category"
      isLoading={isLoading}
      showAllOnFocus
    />
  );
}
