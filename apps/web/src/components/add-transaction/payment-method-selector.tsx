"use client";

import { Banknote, CreditCard } from "lucide-react";
import type { PaymentMethod } from "@/hooks/use-payment-methods";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

interface PaymentMethodSelectorProps {
  paymentMethods: PaymentMethod[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  isLoading?: boolean;
}

function TypeBadge({ type }: { type: PaymentMethod["type"] }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-text-secondary">
      {type === "CASH" ? (
        <Banknote className="h-3 w-3" />
      ) : (
        <CreditCard className="h-3 w-3" />
      )}
      {type === "CASH" ? "Cash" : "Debit Card"}
    </span>
  );
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
        <div className="h-10 rounded-2xl skeleton-shimmer" />
      </div>
    );
  }

  if (paymentMethods.length === 0) return null;

  if (paymentMethods.length === 1) {
    const method = paymentMethods[0];
    return (
      <div className="space-y-2 field-slide-down">
        <Label>Payment Method</Label>
        <div className="flex items-center gap-2 h-10 px-3 rounded-2xl border border-border bg-surface text-sm">
          <span
            className="h-2.5 w-2.5 rounded-full shrink-0"
            style={{ backgroundColor: method.color }}
          />
          <span className="truncate font-medium">{method.name}</span>
          <TypeBadge type={method.type} />
        </div>
      </div>
    );
  }

  const selectedMethod = paymentMethods.find((m) => m.id === selectedId);

  return (
    <div className="space-y-2 field-slide-down">
      <Label>Payment Method</Label>
      <Select
        value={selectedId ?? ""}
        onValueChange={onSelect}
      >
        <SelectTrigger>
          {selectedMethod ? (
            <span className="flex items-center gap-2 min-w-0">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: selectedMethod.color }}
              />
              <span className="truncate">{selectedMethod.name}</span>
              <TypeBadge type={selectedMethod.type} />
            </span>
          ) : (
            <span className="text-text-disabled">Select a payment method</span>
          )}
        </SelectTrigger>
        <SelectContent>
          {paymentMethods.map((method) => (
            <SelectItem key={method.id} value={method.id}>
              <span className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: method.color }}
                />
                <span>{method.name}</span>
                <TypeBadge type={method.type} />
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
