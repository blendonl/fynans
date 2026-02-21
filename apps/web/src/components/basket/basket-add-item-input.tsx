"use client";

import { useState, useCallback } from "react";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { useItemsWithPrices } from "@/hooks/use-items-with-prices";
import { formatCurrency } from "@/utils/currency";

interface BasketAddItemInputProps {
  onAdd: (name: string) => void;
}

export function BasketAddItemInput({ onAdd }: BasketAddItemInputProps) {
  const [search, setSearch] = useState("");
  const { items, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useItemsWithPrices(search);

  const options: ComboboxOption[] = items.map((item) => ({
    value: item.name,
    label: item.name,
    sublabel:
      item.storeCount === 0
        ? undefined
        : item.minPrice === item.maxPrice
          ? formatCurrency(item.minPrice)
          : `${formatCurrency(item.minPrice)} – ${formatCurrency(item.maxPrice)}`,
  }));

  const handleSelect = useCallback(
    (value: string) => {
      if (value.trim()) {
        onAdd(value.trim());
        setSearch("");
      }
    },
    [onAdd]
  );

  const handleCreateNew = useCallback(
    (name: string) => {
      if (name.trim()) {
        onAdd(name.trim());
        setSearch("");
      }
    },
    [onAdd]
  );

  return (
    <Combobox
      options={options}
      value={null}
      onChange={handleSelect}
      onSearchChange={setSearch}
      onCreateNew={handleCreateNew}
      onLoadMore={hasNextPage ? () => fetchNextPage() : undefined}
      hasMore={hasNextPage}
      isLoadingMore={isFetchingNextPage}
      placeholder="Add item to list..."
      isLoading={isLoading}
      className="min-h-12 rounded-2xl"
    />
  );
}
