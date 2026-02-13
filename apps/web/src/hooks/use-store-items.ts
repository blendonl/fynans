import { useInfiniteQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { PAGE_SIZE, type PaginatedResponse } from "@/lib/pagination";

interface StoreItemResult {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  isDiscounted: boolean;
}

export function useStoreItems(storeId: string | undefined, search: string) {
  const query = useInfiniteQuery({
    queryKey: ["store-items", storeId, search],
    queryFn: async ({ pageParam = 1 }) => {
      const response = (await apiClient.get(`/stores/${storeId}/items`, {
        search,
        page: String(pageParam),
        limit: String(PAGE_SIZE),
      })) as PaginatedResponse<StoreItemResult>;
      return response;
    },
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      return (lastPageParam as number) * PAGE_SIZE < (lastPage.total ?? 0)
        ? (lastPageParam as number) + 1
        : undefined;
    },
    initialPageParam: 1,
    enabled: !!storeId,
  });

  return {
    items: query.data?.pages.flatMap((p) => p.data) ?? [],
    isLoading: query.isLoading,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: !!query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  };
}
