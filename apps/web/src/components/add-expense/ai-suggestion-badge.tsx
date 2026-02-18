"use client";

import { Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AiSuggestionBadgeProps {
  suggestion: { categoryId: string; categoryName: string } | null;
  isLoading: boolean;
  onAccept: (category: { id: string; name: string }) => void;
  onDismiss: () => void;
  categories?: { id: string; name: string }[];
}

export function AiSuggestionBadge({
  suggestion,
  isLoading,
  onAccept,
  onDismiss,
  categories,
}: AiSuggestionBadgeProps) {
  if (!suggestion && !isLoading) return null;

  const handleAccept = () => {
    if (!suggestion) return;
    if (categories) {
      const cat = categories.find((c) => c.id === suggestion.categoryId);
      if (cat) onAccept(cat);
    } else {
      onAccept({ id: suggestion.categoryId, name: suggestion.categoryName });
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-xl text-sm",
        "bg-primary/10 border border-primary/20",
        "field-slide-down",
      )}
    >
      <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
      {isLoading ? (
        <div className="h-4 w-24 rounded bg-primary/20 animate-pulse" />
      ) : suggestion ? (
        <>
          <span className="text-text-secondary">AI suggests:</span>
          <button
            type="button"
            onClick={handleAccept}
            className="font-semibold text-primary hover:text-primary-variant transition-colors cursor-pointer"
          >
            {suggestion.categoryName}
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="ml-auto p-0.5 rounded-full hover:bg-primary/20 transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5 text-text-secondary" />
          </button>
        </>
      ) : null}
    </div>
  );
}
