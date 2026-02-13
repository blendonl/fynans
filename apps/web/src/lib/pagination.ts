export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const PAGE_SIZE = 20;
export const DASHBOARD_RECENT_LIMIT = 5;
