import { useExpenseCategories } from "@/hooks/use-expense-categories";
import { useItemCategories } from "@/hooks/use-item-categories";
import { useIncomeCategories } from "@/hooks/use-income-categories";

/** Backward-compatible composite hook that combines all category queries. */
export function useCategories(expenseCategorySearch?: string) {
  const {
    categories,
    isLoading,
    fetchNextPage: fetchNextCategoryPage,
    hasNextPage,
    isFetchingNextPage: isFetchingNextCategoryPage,
    createCategory,
  } = useExpenseCategories(expenseCategorySearch);

  const { itemCategories, createItemCategory } = useItemCategories();
  const { incomeCategories } = useIncomeCategories();

  return {
    categories,
    incomeCategories,
    itemCategories,
    isLoading,
    fetchNextCategoryPage,
    hasNextCategoryPage: !!hasNextPage,
    isFetchingNextCategoryPage,
    createCategory,
    createItemCategory,
  };
}
