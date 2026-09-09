import { Injectable, Inject } from '@nestjs/common';
import { DomainNotFoundException } from '~common/exceptions/domain.exceptions';
import { type IExpenseCategoryRepository } from '../../domain/repositories/expense-category.repository.interface';
import { ExpenseCategory } from '../../domain/entities/expense-category.entity';

@Injectable()
export class GetExpenseCategoryByIdUseCase {
  constructor(
    @Inject('ExpenseCategoryRepository')
    private readonly expenseCategoryRepository: IExpenseCategoryRepository,
  ) {}

  async execute(id: string, userId: string): Promise<ExpenseCategory> {
    const category = await this.expenseCategoryRepository.findVisibleById(
      id,
      userId,
    );

    if (!category) {
      throw new DomainNotFoundException('Expense category not found');
    }

    return category;
  }
}
