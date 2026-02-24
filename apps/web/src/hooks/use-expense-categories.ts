import { useMutation, useQueryClient } from "@tanstack/react-query";
import { expenseCategoryControllerFindAll, expenseCategoryControllerCreate } from "@/api/generated/endpoints/expense-category/expense-category";
import { usePaginatedQuery } from "@/hooks/use-paginated-query";
import { queryKeys } from "@/lib/query-keys";

const EXPENSE_CATEGORY_PAGE_SIZE = 10;

export function useExpenseCategories(search?: string) {
  const queryClient = useQueryClient();

  const { data, ...rest } = usePaginatedQuery({
    queryKey: queryKeys.categories.expense(search),
    queryFn: async ({ page, limit }) => {
      const response = await expenseCategoryControllerFindAll({
        search: search as string,
        limit,
        page,
      } as Parameters<typeof expenseCategoryControllerFindAll>[0]);
      const paginated = response.data;
      return {
        ...paginated,
        data: (paginated.data || []).map((cat) => ({
          ...cat,
          isConnectedToStore: Boolean(cat.isConnectedToStore),
        })),
      };
    },
    pageSize: EXPENSE_CATEGORY_PAGE_SIZE,
  });

  const createCategory = useMutation({
    mutationFn: async ({ name, isConnectedToStore }: { name: string; isConnectedToStore: boolean }) => {
      const response = await expenseCategoryControllerCreate({ name, isConnectedToStore });
      const cat = response.data;
      return { id: cat.id, name: cat.name, isConnectedToStore: Boolean(cat.isConnectedToStore) };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.expense() });
    },
  });

  return { categories: data, createCategory, ...rest };
}
