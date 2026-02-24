import { expenseCategoryControllerFindAll } from "@/api/generated/endpoints/expense-category/expense-category";
import { storeItemCategoryControllerFindAll } from "@/api/generated/endpoints/store-item-category/store-item-category";
import { incomeCategoryControllerFindAll } from "@/api/generated/endpoints/income-category/income-category";
import { usePaginatedQuery } from "@/hooks/use-paginated-query";
import { queryKeys, DEFAULT_PAGE_SIZE } from "@/lib/query-keys";

export function useManageExpenseCategories(search: string) {
  const { data, ...rest } = usePaginatedQuery({
    queryKey: queryKeys.categories.expense(search),
    queryFn: async ({ page, limit }) => {
      const response = await expenseCategoryControllerFindAll({
        search,
        page,
        limit,
      } as Parameters<typeof expenseCategoryControllerFindAll>[0]);
      return {
        ...response.data,
        data: (response.data.data || []).map((cat) => ({
          ...cat,
          isConnectedToStore: Boolean(cat.isConnectedToStore),
        })),
      };
    },
    pageSize: DEFAULT_PAGE_SIZE,
  });

  return { categories: data, ...rest };
}

export function useManageItemCategories(search: string) {
  const { data, ...rest } = usePaginatedQuery({
    queryKey: queryKeys.categories.item(search),
    queryFn: async ({ page, limit }) => {
      const response = await storeItemCategoryControllerFindAll({
        search,
        page,
        limit,
      } as unknown as Parameters<typeof storeItemCategoryControllerFindAll>[0]);
      return response.data;
    },
    pageSize: DEFAULT_PAGE_SIZE,
  });

  return { categories: data, ...rest };
}

export function useManageIncomeCategories(search: string) {
  const { data, ...rest } = usePaginatedQuery({
    queryKey: queryKeys.categories.income(search),
    queryFn: async ({ page, limit }) => {
      const response = await incomeCategoryControllerFindAll({
        page,
        limit,
      } as Parameters<typeof incomeCategoryControllerFindAll>[0]);
      return response.data;
    },
    pageSize: DEFAULT_PAGE_SIZE,
  });

  return { categories: data, ...rest };
}
