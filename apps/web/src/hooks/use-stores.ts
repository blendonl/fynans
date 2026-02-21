import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { storeControllerFindAll, storeControllerCreate } from "@/api/generated/endpoints/store/store";

const PAGE_SIZE = 20;

export function useStores(search: string) {
  const queryClient = useQueryClient();

  const storesQuery = useInfiniteQuery({
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
      (lastPageParam as number) * PAGE_SIZE < (lastPage.total ?? 0) ? (lastPageParam as number) + 1 : undefined,
    initialPageParam: 1,
  });

  const allStores = storesQuery.data?.pages.flatMap((p) => p.data) ?? [];

  const createStore = useMutation({
    mutationFn: async ({ name, location }: { name: string; location: string }) => {
      const res = await storeControllerCreate({ name, location });
      return res.data;
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
