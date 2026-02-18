import { useEffect, useRef } from "react";
import { toast } from "sonner";

interface AiSuggestion {
  categoryId: string;
  categoryName: string;
}

export function useAutoAcceptSuggestion(
  suggestion: AiSuggestion | null,
  selectedCategory: { id: string } | null,
  categories: { id: string; name: string }[],
  onAccept: (category: { id: string; name: string }) => void,
) {
  const lastAcceptedRef = useRef<string | null>(null);

  useEffect(() => {
    if (
      suggestion &&
      !selectedCategory &&
      lastAcceptedRef.current !== suggestion.categoryId
    ) {
      const cat = categories.find((c) => c.id === suggestion.categoryId);
      if (cat) {
        onAccept(cat);
        lastAcceptedRef.current = suggestion.categoryId;
        toast.info(`Category auto-suggested: ${cat.name}`);
      }
    }
  }, [suggestion, selectedCategory, categories, onAccept]);
}
