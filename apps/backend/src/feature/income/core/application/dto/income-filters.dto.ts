import { BaseFilters, type BaseFilterData } from '~common/dto/base-filters.dto';
import { TransactionStatus } from '~feature/transaction/core/domain/value-objects/transaction-status.vo';

export interface IncomeFilterData extends BaseFilterData {
  status?: TransactionStatus;
}

export class IncomeFilters extends BaseFilters {
  status?: TransactionStatus;

  constructor(data: IncomeFilterData) {
    super(data);
    this.status = data.status;
  }
}
