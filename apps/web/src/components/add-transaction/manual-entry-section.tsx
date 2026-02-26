"use client";

import { PenLine, ChevronDown } from "lucide-react";
import { ExpenseForm } from "./expense-form";
import { cn } from "@/lib/utils";

interface ManualEntrySectionProps {
  expanded: boolean;
  onToggle: () => void;
  onSuccess: () => void;
  onSaveForReview: () => void;
  scope: "PERSONAL" | "FAMILY";
  familyId: string;
  defaultItemized?: boolean;
  externalPaymentMethodId?: string;
}

export function ManualEntrySection({
  expanded,
  onToggle,
  onSuccess,
  onSaveForReview,
  scope,
  familyId,
  defaultItemized,
  externalPaymentMethodId,
}: ManualEntrySectionProps) {
  return (
    <div className="rounded-3xl bg-surface border border-border-light shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-5 py-4 sm:px-6 cursor-pointer"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
          <PenLine className="h-4 w-4" />
          Add manually
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-text-secondary transition-transform duration-300",
            expanded && "rotate-180",
          )}
        />
      </button>

      <div
        className="filter-expand"
        data-open={expanded}
      >
        <div>
          <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0">
            <ExpenseForm
              onSuccess={onSuccess}
              onSaveForReview={onSaveForReview}
              scope={scope}
              familyId={familyId}
              defaultItemized={defaultItemized}
              externalPaymentMethodId={externalPaymentMethodId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
