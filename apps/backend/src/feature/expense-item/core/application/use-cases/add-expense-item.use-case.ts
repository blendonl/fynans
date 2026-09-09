import { Injectable } from '@nestjs/common';
import { PrismaService } from '~common/prisma/prisma.service';
import { CreateExpenseItemDto } from '../dto/create-expense-item.dto';
import { ExpenseItem } from '../../domain/entities/expense-item.entity';
import { CreateExpenseItemUseCase } from './create-expense-item.use-case';
import { SyncExpenseTotalUseCase } from './sync-expense-total.use-case';

@Injectable()
export class AddExpenseItemUseCase {
  constructor(
    private readonly createExpenseItemUseCase: CreateExpenseItemUseCase,
    private readonly syncExpenseTotalUseCase: SyncExpenseTotalUseCase,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    dto: CreateExpenseItemDto,
    storeId: string,
    userId: string,
  ): Promise<ExpenseItem> {
    return this.prisma.runInTransaction(async () => {
      const item = await this.createExpenseItemUseCase.execute(
        dto,
        storeId,
        userId,
      );

      await this.syncExpenseTotalUseCase.execute(dto.expenseId);

      return item;
    });
  }
}
