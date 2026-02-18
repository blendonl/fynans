"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, calculateBasketItemsTotal } from "@fynans/shared";
import type { BasketItem } from "@fynans/shared";

interface BasketCheckoutBarProps {
  checkedItems: BasketItem[];
  onCheckout: () => void;
}

export function BasketCheckoutBar({ checkedItems, onCheckout }: BasketCheckoutBarProps) {
  if (checkedItems.length === 0) return null;

  const allHavePrice = checkedItems.every((item) => item.price !== null);
  const total = calculateBasketItemsTotal(checkedItems);

  return (
    <div className="fixed left-0 right-0 lg:left-64 z-40 border-t border-glass-border-outer bg-glass-bg-strong backdrop-blur-lg bottom-[calc(3.75rem+env(safe-area-inset-bottom,0px))] lg:bottom-0 lg:pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-between px-4 py-3 max-w-2xl mx-auto">
        <div>
          <p className="text-sm font-medium text-text">
            {checkedItems.length} item{checkedItems.length !== 1 ? "s" : ""} selected
          </p>
          {allHavePrice && (
            <p className="text-xs text-text-secondary font-mono">
              Total: {formatCurrency(total)}
            </p>
          )}
          {!allHavePrice && (
            <p className="text-xs text-text-secondary">
              Prices can be set in checkout
            </p>
          )}
        </div>
        <Button
          onClick={onCheckout}
          size="sm"
          className="gap-1.5"
        >
          <ShoppingCart className="h-4 w-4" />
          Create Expense
        </Button>
      </div>
    </div>
  );
}
