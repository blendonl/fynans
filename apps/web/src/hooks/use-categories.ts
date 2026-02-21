import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { expenseCategoryControllerFindAll, expenseCategoryControllerCreate } from "@/api/generated/endpoints/expense-category/expense-category";
import { storeItemCategoryControllerFindAll, storeItemCategoryControllerCreate } from "@/api/generated/endpoints/store-item-category/store-item-category";
import { incomeCategoryControllerFindAll } from "@/api/generated/endpoints/income-category/income-category";
import type { Category } from "@/types";

const EXPENSE_CATEGORY_PAGE_SIZE = 10;

export function useCategories(expenseCategorySearch?: string) {
  const queryClient = useQueryClient();

  const categoriesQuery = useInfiniteQuery({
    queryKey: ["expense-categories", expenseCategorySearch],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await expenseCategoryControllerFindAll({
        search: expenseCategorySearch as string,
        limit: EXPENSE_CATEGORY_PAGE_SIZE,
        page: pageParam,
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
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      (lastPageParam as number) * EXPENSE_CATEGORY_PAGE_SIZE < (lastPage.total ?? 0) ? (lastPageParam as number) + 1 : undefined,
    initialPageParam: 1,
    enabled: true,
  });

  const itemCategoriesQuery = useQuery({
    queryKey: ["expense-item-categories"],
    queryFn: async () => {
      const response = await storeItemCategoryControllerFindAll({
        limit: 50,
      } as Parameters<typeof storeItemCategoryControllerFindAll>[0]);
      const paginated = response.data;
      return (paginated.data || []).map((cat) => ({
        ...cat,
        isConnectedToStore: Boolean((cat as unknown as Record<string, unknown>).isConnectedToStore),
      }));
    },
  });

  const incomeCategoriesQuery = useQuery({
    queryKey: ["income-categories"],
    queryFn: async () => {
      const response = await incomeCategoryControllerFindAll({
        limit: 50,
      } as Parameters<typeof incomeCategoryControllerFindAll>[0]);
      const paginated = response.data;
      return (paginated.data || []).map((cat) => ({
        ...cat,
        isConnectedToStore: Boolean((cat as unknown as Record<string, unknown>).isConnectedToStore),
      }));
    },
  });

  const createCategory = useMutation({
    mutationFn: async ({ name, isConnectedToStore }: { name: string; isConnectedToStore: boolean }) => {
      const response = await expenseCategoryControllerCreate({
        name,
        isConnectedToStore,
      });
      const cat = response.data;
      return {
        id: cat.id,
        name: cat.name,
        isConnectedToStore: Boolean(cat.isConnectedToStore),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
    },
  });

  const createItemCategory = useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      const response = await storeItemCategoryControllerCreate({ name });
      const cat = response.data;
      return { id: cat.id, name: cat.name };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-item-categories"] });
    },
  });

  return {
    categories: categoriesQuery.data?.pages.flatMap((p) => p.data) ?? [],
    incomeCategories: incomeCategoriesQuery.data || [],
    itemCategories: itemCategoriesQuery.data || [],
    isLoading: categoriesQuery.isLoading,
    fetchNextCategoryPage: categoriesQuery.fetchNextPage,
    hasNextCategoryPage: !!categoriesQuery.hasNextPage,
    isFetchingNextCategoryPage: categoriesQuery.isFetchingNextPage,
    createCategory,
    createItemCategory,
  };
}
