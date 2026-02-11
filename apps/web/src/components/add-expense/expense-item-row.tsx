"use client";

import { Pencil, Trash2 } from "lucide-react";
import { formatCurrency, formatQuantity } from "@fynans/shared";
import type { ExpenseItem } from "@fynans/shared";
import { Button } from "@/components/ui/button";

interface ExpenseItemRowProps {
  item: ExpenseItem;
  index: number;
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
}

export function ExpenseItemRow({ item, index, onEdit, onRemove }: ExpenseItemRowProps) {
  const total = (item.price - item.discount) * item.quantity;

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-surface-variant">
      <div className="flex-1">
        <p className="text-sm font-medium text-text">{item.name}</p>
        <p className="text-xs text-text-secondary">
          {formatCurrency(item.price)} × {formatQuantity(item.quantity)}
          {item.discount > 0 && ` - ${formatCurrency(item.discount)} discount`}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-text">{formatCurrency(total)}</span>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(index)}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-error" onClick={() => onRemove(index)}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
