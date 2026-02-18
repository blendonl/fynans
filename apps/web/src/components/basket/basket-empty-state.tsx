"use client";

import { ShoppingCart } from "lucide-react";

export function BasketEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="relative mb-6">
        <div
          className="absolute -inset-4 rounded-full opacity-15 blur-2xl"
          style={{ background: "var(--primary)" }}
        />
        <div className="relative h-20 w-20 rounded-2xl bg-surface-variant flex items-center justify-center border border-border-light">
          <ShoppingCart className="h-9 w-9 text-text-disabled" />
        </div>
      </div>
      <p className="text-base font-semibold text-text mb-1">
        No items yet
      </p>
      <p className="text-sm text-text-secondary text-center max-w-[280px] leading-relaxed">
        Add items to your shopping list using the input above
      </p>
    </div>
  );
}
