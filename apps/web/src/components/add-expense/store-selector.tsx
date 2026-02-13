"use client";

import { useMemo } from "react";
import type { Store } from "@fynans/shared";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";

interface StoreSelectorProps {
  stores: Store[];
  selectedStore: Store | null;
  onSelect: (store: Store) => void;
  onClear: () => void;
  onSearch: (query: string) => void;
  onCreateNew: (name: string) => void;
  isLoading: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

export function StoreSelector({
  stores,
  selectedStore,
  onSelect,
  onClear,
  onSearch,
  onCreateNew,
  isLoading,
  onLoadMore,
  hasMore,
  isLoadingMore,
}: StoreSelectorProps) {
  const options: ComboboxOption[] = useMemo(
    () =>
      stores.map((store) => ({
        value: store.id,
        label: store.name,
        sublabel: store.location || undefined,
      })),
    [stores]
  );

  return (
    <div className="space-y-2">
      <Label>Store</Label>
      <Combobox
        options={options}
        value={selectedStore?.id ?? null}
        displayValue={selectedStore?.name}
        onChange={(id) => {
          const store = stores.find((s) => s.id === id);
          if (store) onSelect(store);
        }}
        onClear={onClear}
        onSearchChange={onSearch}
        onCreateNew={onCreateNew}
        onLoadMore={onLoadMore}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        placeholder="Search for a store"
        isLoading={isLoading}
        showAllOnFocus
      />
    </div>
  );
}
