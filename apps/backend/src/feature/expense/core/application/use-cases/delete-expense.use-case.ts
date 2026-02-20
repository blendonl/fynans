import { Injectable, Inject } from '@nestjs/common';
import { DomainNotFoundException, DomainForbiddenException } from '~common/exceptions/domain.exceptions';
import { PrismaService } from '../../../../../common/prisma/prisma.service';
import { type IExpenseRepository } from '../../domain/repositories/expense.repository.interface';

@Injectable()
export class DeleteExpenseUseCase {
  constructor(
    @Inject('ExpenseRepository')
    private readonly expenseRepository: IExpenseRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    const expense = await this.expenseRepository.findById(id);

    if (!expense) {
      throw new DomainNotFoundException('Expense not found');
    }

    const isOwner = await this.expenseRepository.verifyOwnership(id, userId);
    if (!isOwner) {
      throw new DomainForbiddenException('Access denied');
    }

    // Use Prisma transaction to delete atomically
    await this.prisma.$transaction(async (tx) => {
      // 1. Delete all ExpenseItems
      await tx.expenseItem.deleteMany({
        where: { expenseId: id },
      });

      // 2. Delete Expense
      await tx.expense.delete({
        where: { id },
      });

      // 3. Delete Transaction
      await tx.transaction.delete({
        where: { id: expense.transactionId },
      });
    });
  }
}
