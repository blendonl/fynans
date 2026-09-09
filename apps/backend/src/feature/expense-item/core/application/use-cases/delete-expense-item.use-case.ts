import { Injectable, Inject } from '@nestjs/common';
import { DomainNotFoundException } from '~common/exceptions/domain.exceptions';
import { PrismaService } from '~common/prisma/prisma.service';
import { type IExpenseItemRepository } from '../../domain/repositories/expense-item.repository.interface';
import { SyncExpenseTotalUseCase } from './sync-expense-total.use-case';

@Injectable()
export class DeleteExpenseItemUseCase {
  constructor(
    @Inject('ExpenseItemRepository')
    private readonly expenseItemRepository: IExpenseItemRepository,
    private readonly syncExpenseTotalUseCase: SyncExpenseTotalUseCase,
    private readonly prisma: PrismaService,
  ) {}

  async execute(id: string): Promise<void> {
    const item = await this.expenseItemRepository.findById(id);

    if (!item) {
      throw new DomainNotFoundException('Expense item not found');
    }

    await this.prisma.runInTransaction(async () => {
      await this.expenseItemRepository.delete(id);
      await this.syncExpenseTotalUseCase.execute(item.expenseId);
    });
  }
}
