"use client";

import { useState, useRef } from "react";
import { X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BasketItem } from "@/types";
import { formatCurrency, formatQuantity } from "@/utils/currency";

interface BasketItemRowProps {
  item: BasketItem;
  isChecked: boolean;
  onToggle: (id: string) => void;
  onUpdate: (data: { itemId: string; price?: number | null; quantity?: number; name?: string }) => void;
  onRemove: (id: string) => void;
}

export function BasketItemRow({
  item,
  isChecked,
  onToggle,
  onUpdate,
  onRemove,
}: BasketItemRowProps) {
  const [editingPrice, setEditingPrice] = useState(false);
  const [priceValue, setPriceValue] = useState(item.price?.toString() ?? "");
  const [editingQty, setEditingQty] = useState(false);
  const [qtyValue, setQtyValue] = useState(String(item.quantity));
  const priceInputRef = useRef<HTMLInputElement>(null);
  const qtyInputRef = useRef<HTMLInputElement>(null);

  const handlePriceSubmit = () => {
    setEditingPrice(false);
    const parsed = parseFloat(priceValue);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdate({ itemId: item.id, price: parsed });
    } else if (priceValue.trim() === "") {
      onUpdate({ itemId: item.id, price: null });
    }
  };

  const handleQtySubmit = () => {
    setEditingQty(false);
    const parsed = parseFloat(qtyValue);
    if (!isNaN(parsed) && parsed > 0) {
      onUpdate({ itemId: item.id, quantity: parsed });
    } else {
      setQtyValue(String(item.quantity));
    }
  };

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-2xl border bg-surface p-3.5 transition-all duration-200",
        isChecked
          ? "border-primary/30 bg-primary/5"
          : "border-border-light hover:border-border"
      )}
    >
      <button
        type="button"
        onClick={() => onToggle(item.id)}
        className={cn(
          "h-5 w-5 shrink-0 rounded-md border-2 flex items-center justify-center transition-colors cursor-pointer",
          isChecked
            ? "bg-primary border-primary"
            : "border-border hover:border-primary/50"
        )}
      >
        {isChecked && <Check className="h-3 w-3 text-white" />}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium truncate",
            isChecked ? "text-text line-through opacity-60" : "text-text"
          )}
        >
          {item.name}
        </p>
        {item.categoryName && (
          <span className="text-[11px] text-text-secondary">
            {item.categoryName}
          </span>
        )}
      </div>

      <div className="shrink-0">
        {editingQty ? (
          <input
            ref={qtyInputRef}
            type="number"
            step="0.5"
            min="0.001"
            className="w-14 rounded-lg border border-primary bg-surface px-2 py-1 text-sm text-right text-text focus:outline-none"
            value={qtyValue}
            onChange={(e) => setQtyValue(e.target.value)}
            onBlur={handleQtySubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleQtySubmit();
              if (e.key === "Escape") {
                setEditingQty(false);
                setQtyValue(String(item.quantity));
              }
            }}
            autoFocus
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setQtyValue(String(item.quantity));
              setEditingQty(true);
            }}
            className="text-xs font-mono px-2 py-1 rounded-lg text-text-secondary hover:bg-surface-variant transition-colors cursor-pointer"
          >
            ×{formatQuantity(item.quantity)}
          </button>
        )}
      </div>

      <div className="shrink-0">
        {editingPrice ? (
          <input
            ref={priceInputRef}
            type="number"
            step="0.01"
            min="0"
            className="w-20 rounded-lg border border-primary bg-surface px-2 py-1 text-sm text-right text-text focus:outline-none"
            value={priceValue}
            onChange={(e) => setPriceValue(e.target.value)}
            onBlur={handlePriceSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter") handlePriceSubmit();
              if (e.key === "Escape") setEditingPrice(false);
            }}
            autoFocus
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setPriceValue(item.price?.toString() ?? "");
              setEditingPrice(true);
            }}
            className={cn(
              "text-sm font-mono px-2 py-1 rounded-lg transition-colors cursor-pointer",
              item.price !== null
                ? "text-text hover:bg-surface-variant"
                : "text-text-disabled hover:bg-surface-variant italic"
            )}
          >
            {item.price !== null ? formatCurrency(item.price) : "add price"}
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="h-7 w-7 shrink-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-error/10 transition-all cursor-pointer"
      >
        <X className="h-3.5 w-3.5 text-error" />
      </button>
    </div>
  );
}
