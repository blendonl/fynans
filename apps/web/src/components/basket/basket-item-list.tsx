"use client";

import type { BasketItem } from "@fynans/shared";
import { BasketItemRow } from "./basket-item-row";
import { BasketEmptyState } from "./basket-empty-state";

interface BasketItemListProps {
  items: BasketItem[];
  checkedIds: Set<string>;
  onToggle: (id: string) => void;
  onUpdate: (data: { itemId: string; price?: number | null; quantity?: number; name?: string }) => void;
  onRemove: (id: string) => void;
  isLoading: boolean;
}

export function BasketItemList({
  items,
  checkedIds,
  onToggle,
  onUpdate,
  onRemove,
  isLoading,
}: BasketItemListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-[72px] rounded-2xl skeleton-shimmer" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return <BasketEmptyState />;
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <BasketItemRow
          key={item.id}
          item={item}
          isChecked={checkedIds.has(item.id)}
          onToggle={onToggle}
          onUpdate={onUpdate}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}
