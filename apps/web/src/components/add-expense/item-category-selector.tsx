"use client";

import { useMemo } from "react";
import type { Category } from "@/types";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { AiSuggestionBadge } from "./ai-suggestion-badge";

interface ItemCategorySelectorProps {
  itemCategories: Category[];
  selectedCategory: Category | null;
  onSelect: (category: Category) => void;
  onClear: () => void;
  onCreateNew: (name: string) => void;
  isLoading: boolean;
  aiSuggestion?: { categoryId: string; categoryName: string } | null;
  onAcceptSuggestion?: () => void;
  onDismissSuggestion?: () => void;
  isSuggestionLoading?: boolean;
}

export function ItemCategorySelector({
  itemCategories,
  selectedCategory,
  onSelect,
  onClear,
  onCreateNew,
  isLoading,
  aiSuggestion,
  onAcceptSuggestion,
  onDismissSuggestion,
  isSuggestionLoading,
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
    <div className="space-y-2">
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
      {(aiSuggestion || isSuggestionLoading) && onAcceptSuggestion && onDismissSuggestion && (
        <AiSuggestionBadge
          suggestion={aiSuggestion ?? null}
          isLoading={!!isSuggestionLoading}
          categories={itemCategories}
          onAccept={(cat) => {
            onSelect(cat as Category);
            onAcceptSuggestion();
          }}
          onDismiss={onDismissSuggestion}
        />
      )}
    </div>
  );
}
