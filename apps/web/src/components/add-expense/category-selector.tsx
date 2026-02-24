"use client";

import { useMemo } from "react";
import type { Category } from "@/types";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";

import { AiSuggestionBadge } from "./ai-suggestion-badge";

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
  aiSuggestion?: { categoryId: string; categoryName: string } | null;
  onAcceptSuggestion?: () => void;
  onDismissSuggestion?: () => void;
  isSuggestionLoading?: boolean;
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
  aiSuggestion,
  onAcceptSuggestion,
  onDismissSuggestion,
  isSuggestionLoading,
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
        showAllOnFocus
        className="min-h-12 rounded-2xl"
      />
      {(aiSuggestion || isSuggestionLoading) && onAcceptSuggestion && onDismissSuggestion && (
        <AiSuggestionBadge
          suggestion={aiSuggestion ?? null}
          isLoading={!!isSuggestionLoading}
          categories={categories}
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
