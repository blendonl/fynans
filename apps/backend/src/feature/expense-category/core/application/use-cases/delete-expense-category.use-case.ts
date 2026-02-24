import { Injectable, Inject } from '@nestjs/common';
import {
  DomainNotFoundException,
  DomainValidationException,
} from '~common/exceptions/domain.exceptions';
import { type IExpenseCategoryRepository } from '../../domain/repositories/expense-category.repository.interface';

@Injectable()
export class DeleteExpenseCategoryUseCase {
  constructor(
    @Inject('ExpenseCategoryRepository')
    private readonly expenseCategoryRepository: IExpenseCategoryRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const category = await this.expenseCategoryRepository.findById(id);

    if (!category) {
      throw new DomainNotFoundException('Expense category not found');
    }

    await this.validate(id);

    await this.expenseCategoryRepository.delete(id);
  }

  private async validate(id: string): Promise<void> {
    const children = await this.expenseCategoryRepository.findChildren(id);
    if (children.length > 0) {
      throw new DomainValidationException(
        'Cannot delete category with child categories',
      );
    }

    const expenseCount =
      await this.expenseCategoryRepository.countExpensesByCategory(id);
    if (expenseCount > 0) {
      throw new DomainValidationException(
        'Cannot delete category that is used by existing expenses',
      );
    }
  }
}
