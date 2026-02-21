import { useInfiniteQuery } from "@tanstack/react-query";
import { itemControllerFindAll } from "@/api/generated/endpoints/items/items";

const PAGE_SIZE = 20;

export function useItems(search: string) {
  const itemsQuery = useInfiniteQuery({
    queryKey: ["items", search],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await itemControllerFindAll({
        search,
        page: pageParam,
        limit: PAGE_SIZE,
      } as Parameters<typeof itemControllerFindAll>[0]);
      return response.data;
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
