"use client";

import { CreditCard } from "lucide-react";
import type { PaymentMethod } from "@/hooks/use-payment-methods";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface PaymentMethodSelectorProps {
  paymentMethods: PaymentMethod[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  isLoading?: boolean;
}

export function PaymentMethodSelector({
  paymentMethods,
  selectedId,
  onSelect,
  isLoading,
}: PaymentMethodSelectorProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>Payment Method</Label>
        <div className="flex gap-2">
          <div className="h-9 w-20 rounded-xl skeleton-shimmer" />
          <div className="h-9 w-24 rounded-xl skeleton-shimmer" />
        </div>
      </div>
    );
  }

  if (paymentMethods.length === 0) return null;

  return (
    <div className="space-y-2 field-slide-down">
      <Label>Payment Method</Label>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl transition-all cursor-pointer",
            selectedId === null
              ? "bg-primary/10 text-primary ring-1 ring-primary/20"
              : "bg-surface-variant text-text-secondary hover:text-text hover:bg-surface-variant/80"
          )}
        >
          <CreditCard className="h-3.5 w-3.5" />
          None
        </button>
        {paymentMethods.map((method) => (
          <button
            key={method.id}
            type="button"
            onClick={() => onSelect(method.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl transition-all cursor-pointer",
              selectedId === method.id
                ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                : "bg-surface-variant text-text-secondary hover:text-text hover:bg-surface-variant/80"
            )}
          >
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: method.color }}
            />
            {method.name}
          </button>
        ))}
      </div>
    </div>
  );
}
