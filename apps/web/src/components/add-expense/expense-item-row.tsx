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
    <div className="p-3 rounded-lg bg-surface-variant space-y-2">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-text truncate">{item.name}</p>
          <p className="text-xs text-text-secondary">
            {formatCurrency(item.price)}
            {item.discount > 0 && ` - ${formatCurrency(item.discount)} disc.`}
          </p>
        </div>
        <div className="flex items-center gap-0.5 -mr-2 -mt-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(index)}>
            <Pencil className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-error" onClick={() => onRemove(index)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 rounded-full"
            onClick={() => onQuantityChange(index, Math.max(0.1, item.quantity - 1))}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <input
            type="number"
            value={item.quantity}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val) && val > 0) onQuantityChange(index, val);
            }}
            className="w-10 text-center text-sm bg-transparent border-none outline-none text-text [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            step="0.1"
            min="0.1"
          />
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 rounded-full"
            onClick={() => onQuantityChange(index, item.quantity + 1)}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        <span className="text-sm font-semibold text-text">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
