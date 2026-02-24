import { useInfiniteQuery } from "@tanstack/react-query";
import { expenseCategoryControllerFindAll } from "@/api/generated/endpoints/expense-category/expense-category";
import { storeItemCategoryControllerFindAll } from "@/api/generated/endpoints/store-item-category/store-item-category";
import { incomeCategoryControllerFindAll } from "@/api/generated/endpoints/income-category/income-category";

const PAGE_SIZE = 20;

export function useManageExpenseCategories(search: string) {
  const query = useInfiniteQuery({
    queryKey: ["expense-categories", search],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await expenseCategoryControllerFindAll({
        search,
        page: pageParam,
        limit: PAGE_SIZE,
      } as Parameters<typeof expenseCategoryControllerFindAll>[0]);
      return {
        ...response.data,
        data: (response.data.data || []).map((cat) => ({
          ...cat,
          isConnectedToStore: Boolean(cat.isConnectedToStore),
        })),
      };
    },
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      (lastPageParam as number) * PAGE_SIZE < (lastPage.total ?? 0)
        ? (lastPageParam as number) + 1
        : undefined,
    initialPageParam: 1,
  });

  return {
    categories: query.data?.pages.flatMap((p) => p.data) ?? [],
    isLoading: query.isLoading,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: !!query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  };
}

export function useManageItemCategories(search: string) {
  const query = useInfiniteQuery({
    queryKey: ["expense-item-categories", search],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await storeItemCategoryControllerFindAll({
        page: pageParam,
        limit: PAGE_SIZE,
      } as Parameters<typeof storeItemCategoryControllerFindAll>[0]);
      return response.data;
    },
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      (lastPageParam as number) * PAGE_SIZE < (lastPage.total ?? 0)
        ? (lastPageParam as number) + 1
        : undefined,
    initialPageParam: 1,
  });

  return {
    categories: query.data?.pages.flatMap((p) => p.data) ?? [],
    isLoading: query.isLoading,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: !!query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  };
}

export function useManageIncomeCategories(search: string) {
  const query = useInfiniteQuery({
    queryKey: ["income-categories", search],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await incomeCategoryControllerFindAll({
        page: pageParam,
        limit: PAGE_SIZE,
      } as Parameters<typeof incomeCategoryControllerFindAll>[0]);
      return response.data;
    },
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      (lastPageParam as number) * PAGE_SIZE < (lastPage.total ?? 0)
        ? (lastPageParam as number) + 1
        : undefined,
    initialPageParam: 1,
  });

  return {
    categories: query.data?.pages.flatMap((p) => p.data) ?? [],
    isLoading: query.isLoading,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: !!query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  };
}
