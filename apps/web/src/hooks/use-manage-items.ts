import { useInfiniteQuery } from "@tanstack/react-query";
import { itemControllerFindAll } from "@/api/generated/endpoints/items/items";

const PAGE_SIZE = 20;

export function useManageItems(search: string) {
  const query = useInfiniteQuery({
    queryKey: ["items", search],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await itemControllerFindAll({
        search,
        page: pageParam,
        limit: PAGE_SIZE,
      } as Parameters<typeof itemControllerFindAll>[0]);
      return response.data;
    },
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      (lastPageParam as number) * PAGE_SIZE < (lastPage.total ?? 0)
        ? (lastPageParam as number) + 1
        : undefined,
    initialPageParam: 1,
  });

  return {
    items: query.data?.pages.flatMap((p) => p.data) ?? [],
    isLoading: query.isLoading,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: !!query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  };
}
