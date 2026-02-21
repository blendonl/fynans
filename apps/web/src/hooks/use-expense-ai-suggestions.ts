import { useEffect, useRef, useCallback } from "react";
import type { Category, ExpenseItem } from "@fynans/shared";
import { useAiCategorySuggestion } from "./use-ai-category-suggestion";
import { useAutoAcceptSuggestion } from "./use-auto-accept-suggestion";

interface UseExpenseAiSuggestionsParams {
  isItemized: boolean;
  simpleNote: string;
  expenseItems: ExpenseItem[];
  categories: Category[];
  selectedCategory: Category | null;
  setSelectedCategory: (cat: Category | null) => void;
}

export function useExpenseAiSuggestions({
  isItemized,
  simpleNote,
  expenseItems,
  categories,
  selectedCategory,
  setSelectedCategory,
}: UseExpenseAiSuggestionsParams) {
  const ai = useAiCategorySuggestion();

  // --- Simple mode: AI category from note ---
  const prevNoteRef = useRef<string>("");
  useEffect(() => {
    if (isItemized) return;
    const note = simpleNote.trim();
    if (note !== prevNoteRef.current) {
      prevNoteRef.current = note;
      if (note.length > 0) {
        ai.setExpenseNote(note);
      } else {
        ai.dismissSimpleExpenseSuggestion();
      }
    }
  }, [simpleNote, isItemized, ai]);

  // Auto-accept simple expense AI suggestion
  const handleSimpleAutoAccept = useCallback(
    (cat: { id: string; name: string }) => setSelectedCategory(cat as Category),
    [setSelectedCategory],
  );
  useAutoAcceptSuggestion(ai.simpleExpenseSuggestion, selectedCategory, categories, handleSimpleAutoAccept);

  // --- Itemized mode: AI expense category from item names ---
  const prevItemNamesRef = useRef<string>("");
  useEffect(() => {
    if (!isItemized) return;
    const names = expenseItems.map((i: ExpenseItem) => i.name);
    const key = names.join("|");
    if (key !== prevItemNamesRef.current && names.length > 0) {
      prevItemNamesRef.current = key;
      ai.setExpenseItemNames(names);
    }
  }, [expenseItems, isItemized, ai]);

  // Auto-accept AI expense suggestion (itemized mode)
  const handleItemizedAutoAccept = useCallback(
    (cat: { id: string; name: string }) => setSelectedCategory(cat as Category),
    [setSelectedCategory],
  );
  useAutoAcceptSuggestion(ai.expenseSuggestion, selectedCategory, categories, handleItemizedAutoAccept);

  const activeSuggestion = isItemized ? ai.expenseSuggestion : ai.simpleExpenseSuggestion;
  const isSuggestionLoading = isItemized ? ai.isExpenseLoading : ai.isSimpleExpenseLoading;

  return {
    ai,
    activeSuggestion,
    isSuggestionLoading,
  };
}
