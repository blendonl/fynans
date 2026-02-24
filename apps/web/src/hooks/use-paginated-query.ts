import { useInfiniteQuery } from "@tanstack/react-query";
import { DEFAULT_PAGE_SIZE } from "@/lib/query-keys";

interface PaginatedPage<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

interface UsePaginatedQueryOptions<T, R = T> {
  queryKey: readonly unknown[];
  queryFn: (params: { page: number; limit: number }) => Promise<PaginatedPage<T>>;
  pageSize?: number;
  enabled?: boolean;
  staleTime?: number;
  /** Transform each item after fetch */
  transform?: (item: T) => R;
}

export function usePaginatedQuery<T, R = T>({
  queryKey,
  queryFn,
  pageSize = DEFAULT_PAGE_SIZE,
  enabled = true,
  staleTime,
  transform,
}: UsePaginatedQueryOptions<T, R>) {
  const query = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 1 }) => {
      const result = await queryFn({ page: pageParam as number, limit: pageSize });
      return {
        ...result,
        data: transform
          ? result.data.map(transform)
          : (result.data as unknown as R[]),
      };
    },
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      (lastPageParam as number) * pageSize < (lastPage.total ?? 0)
        ? (lastPageParam as number) + 1
        : undefined,
    initialPageParam: 1,
    enabled,
    staleTime,
  });

  const data = query.data?.pages.flatMap((p) => p.data) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;

  return {
    data,
    total,
    isLoading: query.isLoading,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: !!query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  };
}
