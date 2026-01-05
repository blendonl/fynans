import { TransactionScope } from '../../../../transaction/core/domain/entities/transaction.entity';

export class ExpenseFilters {
  userId?: string;
  categoryId?: string;
  storeId?: string;
  familyId?: string;
  scope?: TransactionScope;
  dateFrom?: Date;
  dateTo?: Date;
  valueMin?: number;
  valueMax?: number;

  constructor(data: {
    userId?: string;
    categoryId?: string;
    storeId?: string;
    familyId?: string;
    scope?: TransactionScope;
    dateFrom?: Date;
    dateTo?: Date;
    valueMin?: number;
    valueMax?: number;
  }) {
    this.userId = data.userId;
    this.categoryId = data.categoryId;
    this.storeId = data.storeId;
    this.familyId = data.familyId;
    this.scope = data.scope;
    this.dateFrom = data.dateFrom;
    this.dateTo = data.dateTo;
    this.valueMin = data.valueMin;
    this.valueMax = data.valueMax;
  }
}
