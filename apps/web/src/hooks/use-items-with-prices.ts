import { useInfiniteQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { PAGE_SIZE, type PaginatedResponse } from "@/lib/pagination";
import type { ItemWithPrices } from "@/types";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

export function useItemsWithPrices(search: string) {
  const debouncedSearch = useDebouncedValue(search, 300);

  const query = useInfiniteQuery({
    queryKey: ["items-with-prices", debouncedSearch],
    queryFn: async ({ pageParam = 1 }) => {
      const response = (await apiClient.get("/items/with-stores", {
        search: debouncedSearch || undefined,
        page: String(pageParam),
        limit: String(PAGE_SIZE),
      })) as PaginatedResponse<ItemWithPrices>;
      return response;
    },
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      return (lastPageParam as number) * PAGE_SIZE < (lastPage.total ?? 0)
        ? (lastPageParam as number) + 1
        : undefined;
    },
    initialPageParam: 1,
    staleTime: 60 * 1000,
  });

  return {
    items: query.data?.pages.flatMap((p) => p.data) ?? [],
    isLoading: query.isLoading,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: !!query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  };
}
