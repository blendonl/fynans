import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Category } from "@fynans/shared";
import { type PaginatedResponse } from "@/lib/pagination";

const EXPENSE_CATEGORY_PAGE_SIZE = 10;

export function useCategories(expenseCategorySearch?: string) {
  const queryClient = useQueryClient();

  const categoriesQuery = useInfiniteQuery({
    queryKey: ["expense-categories", expenseCategorySearch],
    queryFn: async ({ pageParam = 1 }) => {
      const response = (await apiClient.get("/expense-categories", {
        search: expenseCategorySearch,
        limit: String(EXPENSE_CATEGORY_PAGE_SIZE),
        page: String(pageParam),
      })) as PaginatedResponse<Category>;
      return {
        ...response,
        data: (response.data || []).map((cat) => ({
          ...cat,
          isConnectedToStore: Boolean(cat.isConnectedToStore),
        })),
      };
    },
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      return (lastPageParam as number) * EXPENSE_CATEGORY_PAGE_SIZE < (lastPage.total ?? 0)
        ? (lastPageParam as number) + 1
        : undefined;
    },
    initialPageParam: 1,
    enabled: true,
  });

  const itemCategoriesQuery = useQuery({
    queryKey: ["expense-item-categories"],
    queryFn: async () => {
      const response = (await apiClient.get("/expense-item-categories", {
        limit: "50",
      })) as { data: Category[] };
      return (response.data || []).map((cat) => ({
        ...cat,
        isConnectedToStore: Boolean(cat.isConnectedToStore),
      }));
    },
  });

  const incomeCategoriesQuery = useQuery({
    queryKey: ["income-categories"],
    queryFn: async () => {
      const response = (await apiClient.get("/income-categories", {
        limit: "50",
      })) as { data: Category[] };
      return (response.data || []).map((cat) => ({
        ...cat,
        isConnectedToStore: Boolean(cat.isConnectedToStore),
      }));
    },
  });

  const createCategory = useMutation({
    mutationFn: async ({ name, isConnectedToStore }: { name: string; isConnectedToStore: boolean }) => {
      const response = (await apiClient.post("/expense-categories", {
        name,
        isConnectedToStore,
      })) as Category;
      return {
        id: response.id,
        name: response.name,
        isConnectedToStore: Boolean(response.isConnectedToStore),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
    },
  });

  const createItemCategory = useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      const response = (await apiClient.post("/expense-item-categories", {
        name,
      })) as Category;
      return { id: response.id, name: response.name };
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
