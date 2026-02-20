import { BaseFilters, type BaseFilterData } from '~common/dto/base-filters.dto';

export class ExpenseFilters extends BaseFilters {
  constructor(data: BaseFilterData) {
    super(data);
  }
}
