export class Pagination {
  page: number;
  limit: number;

  constructor(page: number = 1, limit: number = 10) {
    this.page = Math.max(1, page);
    this.limit = Math.min(Math.max(1, limit), 100);
  }

  get skip(): number {
    return (this.page - 1) * this.limit;
  }

  get take(): number {
    return this.limit;
  }
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page?: number;
  limit?: number;
}
