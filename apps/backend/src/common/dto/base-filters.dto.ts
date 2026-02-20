import { TransactionScope } from '~feature/transaction/core/domain/entities/transaction.entity';

export interface BaseFilterData {
  userId?: string;
  categoryId?: string;
  storeId?: string;
  familyId?: string;
  scope?: TransactionScope;
  dateFrom?: Date;
  dateTo?: Date;
  valueMin?: number;
  valueMax?: number;
  search?: string;
}

export class BaseFilters implements BaseFilterData {
  userId?: string;
  categoryId?: string;
  storeId?: string;
  familyId?: string;
  scope?: TransactionScope;
  dateFrom?: Date;
  dateTo?: Date;
  valueMin?: number;
  valueMax?: number;
  search?: string;

  constructor(data: BaseFilterData) {
    this.userId = data.userId;
    this.categoryId = data.categoryId;
    this.storeId = data.storeId;
    this.familyId = data.familyId;
    this.scope = data.scope;
    this.dateFrom = data.dateFrom;
    this.dateTo = data.dateTo;
    this.valueMin = data.valueMin;
    this.valueMax = data.valueMax;
    this.search = data.search;
  }

  /**
   * Creates a BaseFilters instance from a query DTO and authenticated user ID.
   * Automatically handles the familyId-based userId logic and date conversion.
   */
  static fromQuery(
    query: {
      categoryId?: string;
      storeId?: string;
      familyId?: string;
      scope?: TransactionScope;
      dateFrom?: string;
      dateTo?: string;
      valueMin?: number;
      valueMax?: number;
      search?: string;
    },
    userId: string,
  ): BaseFilterData {
    return {
      categoryId: query.categoryId,
      userId: query.familyId ? undefined : userId,
      familyId: query.familyId,
      scope: query.scope,
      storeId: query.storeId,
      dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
      dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
      valueMin: query.valueMin,
      valueMax: query.valueMax,
      search: query.search,
    };
  }
}
