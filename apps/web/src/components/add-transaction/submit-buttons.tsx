"use client";

import { BookmarkPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubmitButtonsProps {
  type: "expense" | "income";
  canSubmit: boolean;
  canSaveForReview: boolean;
  isSubmitting: boolean;
  isSavingForReview: boolean;
  validationMessage: string | null;
  onSubmit: () => void;
  onSaveForReview: () => void;
}

export function SubmitButtons({
  type,
  canSubmit,
  canSaveForReview,
  isSubmitting,
  isSavingForReview,
  validationMessage,
  onSubmit,
  onSaveForReview,
}: SubmitButtonsProps) {
  const label = type === "expense" ? "Create Expense" : "Create Income";

  return (
    <div className="submit-sticky space-y-3">
      <Button
        variant={type}
        className="w-full h-12 text-base font-semibold"
        onClick={onSubmit}
        loading={isSubmitting}
        disabled={!canSubmit || isSavingForReview}
      >
        {label}
      </Button>

      <Button
        variant="outline"
        className="w-full h-10 text-sm font-medium gap-2"
        onClick={onSaveForReview}
        loading={isSavingForReview}
        disabled={!canSaveForReview || isSubmitting}
      >
        <BookmarkPlus className="h-4 w-4" />
        Save for Review
      </Button>

      {!canSubmit && !canSaveForReview && validationMessage && (
        <p className="text-xs text-text-secondary text-center">{validationMessage}</p>
      )}
    </div>
  );
}
