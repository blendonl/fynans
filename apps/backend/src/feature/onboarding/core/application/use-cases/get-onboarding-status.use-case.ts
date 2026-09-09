import { Injectable } from '@nestjs/common';
import { Pagination } from '~common/dto/pagination.dto';
import { ExpenseCategoryService } from '~feature/expense-category/core/application/services/expense-category.service';
import { IncomeCategoryService } from '~feature/income-category/core/application/services/income-category.service';
import { StoreItemCategoryService } from '~feature/store-item-category/core/application/services/store-item-category.service';
import { PaymentMethodService } from '~feature/payment-method/core/application/services/payment-method.service';

export interface OnboardingStatus {
  hasExpenseCategories: boolean;
  hasIncomeCategories: boolean;
  hasItemCategories: boolean;
  hasPaymentMethods: boolean;
}

const FIRST_ROW_ONLY = new Pagination(1, 1);

@Injectable()
export class GetOnboardingStatusUseCase {
  constructor(
    private readonly expenseCategoryService: ExpenseCategoryService,
    private readonly incomeCategoryService: IncomeCategoryService,
    private readonly storeItemCategoryService: StoreItemCategoryService,
    private readonly paymentMethodService: PaymentMethodService,
  ) {}

  async execute(userId: string): Promise<OnboardingStatus> {
    const [
      expenseCategories,
      incomeCategories,
      itemCategories,
      paymentMethods,
    ] = await Promise.all([
      this.expenseCategoryService.findAll(userId, undefined, FIRST_ROW_ONLY),
      this.incomeCategoryService.findAll(userId, undefined, FIRST_ROW_ONLY),
      this.storeItemCategoryService.findAll(userId, undefined, FIRST_ROW_ONLY),
      this.paymentMethodService.findAll(userId),
    ]);

    return {
      hasExpenseCategories: expenseCategories.total > 0,
      hasIncomeCategories: incomeCategories.total > 0,
      hasItemCategories: itemCategories.total > 0,
      hasPaymentMethods: paymentMethods.length > 0,
    };
  }
}
