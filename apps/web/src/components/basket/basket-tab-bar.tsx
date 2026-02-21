"use client";

import { cn } from "@/lib/utils";
import type { Basket } from "@/types";

interface BasketTabBarProps {
  baskets: Basket[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

export function BasketTabBar({ baskets, activeId, onSelect }: BasketTabBarProps) {
  if (baskets.length <= 1) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {baskets.map((basket) => {
        const isActive = basket.id === activeId;
        const label =
          basket.scope === "PERSONAL"
            ? "Personal"
            : basket.familyName ?? "Family";

        return (
          <button
            key={basket.id}
            onClick={() => onSelect(basket.id)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
              isActive
                ? "bg-primary text-white shadow-sm"
                : "bg-surface-variant text-text-secondary hover:text-text hover:bg-surface-variant/80"
            )}
          >
            {label}
            {basket.items.length > 0 && (
              <span className="ml-1.5 text-xs opacity-70">
                ({basket.items.length})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
