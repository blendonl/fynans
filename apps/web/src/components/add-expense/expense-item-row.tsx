"use client";

import { Minus, Plus, Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "@fynans/shared";
import type { ExpenseItem } from "@fynans/shared";
import { Button } from "@/components/ui/button";

interface ExpenseItemRowProps {
  item: ExpenseItem;
  index: number;
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
  onQuantityChange: (index: number, quantity: number) => void;
}

export function ExpenseItemRow({ item, index, onEdit, onRemove, onQuantityChange }: ExpenseItemRowProps) {
  const total = (item.price - item.discount) * item.quantity;

  return (
    <div className="p-3 sm:p-4 rounded-2xl bg-surface-variant space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-text truncate">{item.name}</p>
          <p className="text-xs text-text-secondary mt-0.5">
            {formatCurrency(item.price)}
            {item.discount > 0 && ` - ${formatCurrency(item.discount)} disc.`}
            {item.quantity !== 1 && ` × ${item.quantity}`}
          </p>
        </div>
        <span className="text-sm font-bold text-text tabular-nums shrink-0">{formatCurrency(total)}</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={() => onQuantityChange(index, Math.max(0.1, item.quantity - 1))}
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <input
            type="number"
            value={item.quantity}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val) && val > 0) onQuantityChange(index, val);
            }}
            className="w-12 text-center text-sm font-medium bg-transparent border-none outline-none text-text [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            step="0.1"
            min="0.1"
          />
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={() => onQuantityChange(index, item.quantity + 1)}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => onEdit(index)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-error" onClick={() => onRemove(index)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
