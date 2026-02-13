import { useInfiniteQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { PAGE_SIZE, type PaginatedResponse } from "@/lib/pagination";

interface ItemResult {
  id: string;
  name: string;
  categoryId: string;
}

export function useItems(search: string) {
  const itemsQuery = useInfiniteQuery({
    queryKey: ["items", search],
    queryFn: async ({ pageParam = 1 }) => {
      const response = (await apiClient.get("/items", {
        search,
        page: String(pageParam),
        limit: String(PAGE_SIZE),
      })) as PaginatedResponse<ItemResult>;
      return response;
    },
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      return (lastPageParam as number) * PAGE_SIZE < (lastPage.total ?? 0)
        ? (lastPageParam as number) + 1
        : undefined;
    },
    initialPageParam: 1,
  });

  return {
    items: itemsQuery.data?.pages.flatMap((p) => p.data) ?? [],
    isLoading: itemsQuery.isLoading,
    fetchNextPage: itemsQuery.fetchNextPage,
    hasNextPage: !!itemsQuery.hasNextPage,
    isFetchingNextPage: itemsQuery.isFetchingNextPage,
  };
}
