import { useCallback } from "react";
import { useDebouncedAiSuggestion } from "./use-debounced-ai-suggestion";

export function useAiCategorySuggestion() {
  const item = useDebouncedAiSuggestion({ debounceMs: 600, minLength: 2 });
  const expense = useDebouncedAiSuggestion({ debounceMs: 800 });
  const simpleExpense = useDebouncedAiSuggestion({ debounceMs: 700, minLength: 3 });
  const income = useDebouncedAiSuggestion({ debounceMs: 700, minLength: 3 });

  const setCurrentItemName = useCallback(
    (name: string) => {
      item.trigger({ type: "item", itemNames: [name] }, name.length);
    },
    [item],
  );

  const setExpenseItemNames = useCallback(
    (names: string[]) => {
      expense.trigger({ type: "expense", itemNames: names }, names.length);
    },
    [expense],
  );

  const setExpenseNote = useCallback(
    (note: string) => {
      simpleExpense.trigger({ type: "expense", note }, note.length);
    },
    [simpleExpense],
  );

  const setIncomeNote = useCallback(
    (note: string) => {
      income.trigger({ type: "income", note }, note.length);
    },
    [income],
  );

  return {
    itemSuggestion: item.suggestion,
    expenseSuggestion: expense.suggestion,
    simpleExpenseSuggestion: simpleExpense.suggestion,
    incomeSuggestion: income.suggestion,
    isItemLoading: item.isLoading,
    isExpenseLoading: expense.isLoading,
    isSimpleExpenseLoading: simpleExpense.isLoading,
    isIncomeLoading: income.isLoading,
    setCurrentItemName,
    setExpenseItemNames,
    setExpenseNote,
    setIncomeNote,
    dismissItemSuggestion: item.dismiss,
    dismissExpenseSuggestion: expense.dismiss,
    dismissSimpleExpenseSuggestion: simpleExpense.dismiss,
    dismissIncomeSuggestion: income.dismiss,
  };
}
