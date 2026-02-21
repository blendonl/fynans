import { useInfiniteQuery } from "@tanstack/react-query";
import { storeItemControllerFindAll } from "@/api/generated/endpoints/store-item/store-item";

const PAGE_SIZE = 20;

export function useStoreItems(storeId: string | undefined, search: string) {
  const query = useInfiniteQuery({
    queryKey: ["store-items", storeId, search],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await storeItemControllerFindAll(storeId!, {
        search,
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
