import { useInfiniteQuery } from "@tanstack/react-query";
import { itemControllerFindWithStores } from "@/api/generated/endpoints/items/items";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

const PAGE_SIZE = 20;

export function useItemsWithPrices(search: string) {
  const debouncedSearch = useDebouncedValue(search, 300);

  const query = useInfiniteQuery({
    queryKey: ["items-with-prices", debouncedSearch],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await itemControllerFindWithStores({
        search: debouncedSearch || "",
        page: pageParam,
        limit: PAGE_SIZE,
      });
      return response.data;
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
