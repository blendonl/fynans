import { BaseFilters, type BaseFilterData } from '~common/dto/base-filters.dto';
import { TransactionStatus } from '~feature/transaction/core/domain/value-objects/transaction-status.vo';

export interface ExpenseFilterData extends BaseFilterData {
  status?: TransactionStatus;
}

export class ExpenseFilters extends BaseFilters {
  status?: TransactionStatus;

  constructor(data: ExpenseFilterData) {
    super(data);
    this.status = data.status;
  }
}
