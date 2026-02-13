import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Store } from "@fynans/shared";
import { PAGE_SIZE, type PaginatedResponse } from "@/lib/pagination";

export function useStores(search: string) {
  const queryClient = useQueryClient();

  const storesQuery = useInfiniteQuery({
    queryKey: ["stores", search],
    queryFn: async ({ pageParam = 1 }) => {
      const response = (await apiClient.get("/stores", {
        search,
        page: String(pageParam),
        limit: String(PAGE_SIZE),
      })) as PaginatedResponse<Store>;
      return response;
    },
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      return (lastPageParam as number) * PAGE_SIZE < (lastPage.total ?? 0)
        ? (lastPageParam as number) + 1
        : undefined;
    },
    initialPageParam: 1,
  });

  const allStores = storesQuery.data?.pages.flatMap((p) => p.data) ?? [];

  const createStore = useMutation({
    mutationFn: async ({ name, location }: { name: string; location: string }) => {
      const response = (await apiClient.post("/stores", { name, location })) as Store;
      return response;
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
