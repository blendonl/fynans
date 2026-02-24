import { useInfiniteQuery } from "@tanstack/react-query";
import { storeControllerFindAll } from "@/api/generated/endpoints/store/store";

const PAGE_SIZE = 20;

export function useManageStores(search: string) {
  const query = useInfiniteQuery({
    queryKey: ["stores", search],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await storeControllerFindAll({
        search,
        page: pageParam,
        limit: PAGE_SIZE,
      });
      return response.data;
    },
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      (lastPageParam as number) * PAGE_SIZE < (lastPage.total ?? 0)
        ? (lastPageParam as number) + 1
        : undefined,
    initialPageParam: 1,
  });

  return {
    stores: query.data?.pages.flatMap((p) => p.data) ?? [],
    isLoading: query.isLoading,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: !!query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  };
}
