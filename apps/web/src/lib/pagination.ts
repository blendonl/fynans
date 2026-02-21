export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const PAGE_SIZE = 20;
export const DASHBOARD_RECENT_LIMIT = 5;

export function paginatedQueryOptions(pageSize: number = PAGE_SIZE) {
  return {
    getNextPageParam: (lastPage: { total?: number }, _allPages: unknown, lastPageParam: number) =>
      lastPageParam * pageSize < (lastPage.total ?? 0) ? lastPageParam + 1 : undefined,
    initialPageParam: 1,
  };
}
