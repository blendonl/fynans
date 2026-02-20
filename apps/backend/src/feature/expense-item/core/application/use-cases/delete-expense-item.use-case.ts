import { Injectable, Inject } from '@nestjs/common';
import { DomainNotFoundException } from '~common/exceptions/domain.exceptions';
import { type IExpenseItemRepository } from '../../domain/repositories/expense-item.repository.interface';

@Injectable()
export class DeleteExpenseItemUseCase {
  constructor(
    @Inject('ExpenseItemRepository')
    private readonly expenseItemRepository: IExpenseItemRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const item = await this.expenseItemRepository.findById(id);

    if (!item) {
      throw new DomainNotFoundException('Expense item not found');
    }

    await this.expenseItemRepository.delete(id);
  }
}
