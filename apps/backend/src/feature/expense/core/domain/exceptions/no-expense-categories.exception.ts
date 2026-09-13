import { DomainValidationException } from '~common/exceptions/domain.exceptions';

export const NO_EXPENSE_CATEGORIES_ERROR = 'NoExpenseCategories';

const NO_EXPENSE_CATEGORIES_MESSAGE =
  'You have no expense categories yet. Create one — "Groceries", for example — and record this expense against it.';

export class NoExpenseCategoriesException extends DomainValidationException {
  constructor() {
    super(NO_EXPENSE_CATEGORIES_MESSAGE);
    this.name = NO_EXPENSE_CATEGORIES_ERROR;
  }
}
