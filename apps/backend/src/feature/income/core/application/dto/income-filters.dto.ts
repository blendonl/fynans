import { BaseFilters, type BaseFilterData } from '~common/dto/base-filters.dto';

export class IncomeFilters extends BaseFilters {
  constructor(data: BaseFilterData) {
    super(data);
  }
}
