import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Store } from "@/types";
import { PAGE_SIZE, paginatedQueryOptions, type PaginatedResponse } from "@/lib/pagination";

export function useStores(search: string) {
  const queryClient = useQueryClient();

  const storesQuery = useInfiniteQuery({
    queryKey: ["stores", search],
    queryFn: async ({ pageParam = 1 }) => {
      return apiClient.get<PaginatedResponse<Store>>("/stores", {
        search,
        page: String(pageParam),
        limit: String(PAGE_SIZE),
      });
    },
    ...paginatedQueryOptions(PAGE_SIZE),
  });

  const allStores = storesQuery.data?.pages.flatMap((p) => p.data) ?? [];

  const createStore = useMutation({
    mutationFn: async ({ name, location }: { name: string; location: string }) => {
      return apiClient.post<Store>("/stores", { name, location });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
    },
  });

  return {
    stores: allStores,
    isLoading: storesQuery.isLoading,
    fetchNextPage: storesQuery.fetchNextPage,
    hasNextPage: !!storesQuery.hasNextPage,
    isFetchingNextPage: storesQuery.isFetchingNextPage,
    createStore,
  };
}
