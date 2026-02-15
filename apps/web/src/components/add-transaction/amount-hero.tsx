"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface AmountHeroProps {
  value: string;
  onChange?: (value: string) => void;
  type: "expense" | "income";
  readOnly?: boolean;
  sublabel?: string;
  autoFocus?: boolean;
}

export function AmountHero({ value, onChange, type, readOnly = false, sublabel, autoFocus = false }: AmountHeroProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <div className="amount-scale-in flex flex-col items-center py-6 lg:py-10">
      <div className="flex items-baseline gap-1">
        <span
          className={cn(
            "text-2xl lg:text-3xl font-medium transition-colors duration-200",
            type === "expense" ? "text-expense/60" : "text-income/60"
          )}
        >
          ALL
        </span>
        <input
          ref={inputRef}
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          readOnly={readOnly}
          placeholder="0.00"
          step="0.01"
          min="0"
          className={cn(
            "bg-transparent border-none outline-none text-center",
            "text-4xl sm:text-5xl lg:text-6xl font-bold tabular-nums",
            "placeholder:text-text-disabled",
            "transition-colors duration-200",
            "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
            type === "expense" ? "text-expense" : "text-income",
            readOnly && "cursor-default",
            // Dynamic width based on content
            value ? "w-auto min-w-[3ch] max-w-[10ch]" : "w-[4ch]"
          )}
          style={{ width: value ? `${Math.max(3, Math.min(10, value.length + 1))}ch` : undefined }}
        />
      </div>
      {sublabel && (
        <p className="text-xs text-text-secondary mt-1 field-slide-down">{sublabel}</p>
      )}
      {!readOnly && (
        <div
          className={cn(
            "h-0.5 w-16 mt-2 rounded-full transition-colors duration-200",
            type === "expense" ? "bg-expense/30" : "bg-income/30"
          )}
        />
      )}
    </div>
  );
}
