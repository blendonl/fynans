import { Injectable, Inject } from '@nestjs/common';
import {
  DomainForbiddenException,
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

  async execute(id: string, userId: string): Promise<void> {
    const category = await this.expenseCategoryRepository.findById(id);

    if (!category) {
      throw new DomainNotFoundException('Expense category not found');
    }

    if (category.userId !== userId) {
      throw new DomainForbiddenException(
        'Expense category does not belong to this user',
      );
    }

    await this.validate(id, userId);

    await this.expenseCategoryRepository.delete(id);
  }

  private async validate(id: string, userId: string): Promise<void> {
    const children = await this.expenseCategoryRepository.findChildren(
      id,
      userId,
    );
    if (children.length > 0) {
      throw new DomainValidationException(
        'Cannot delete category with child categories',
      );
    }

    const expenseCount =
      await this.expenseCategoryRepository.countExpensesInOwnedCategory(
        id,
        userId,
      );
    if (expenseCount > 0) {
      throw new DomainValidationException(
        'Cannot delete category that is used by existing expenses',
      );
    }
  }
}
