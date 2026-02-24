import { Injectable, Inject } from '@nestjs/common';
import { DomainNotFoundException, DomainForbiddenException } from '~common/exceptions/domain.exceptions';
import { PrismaService } from '../../../../../common/prisma/prisma.service';
import { type IExpenseRepository } from '../../domain/repositories/expense.repository.interface';
import { PaymentMethodService } from '../../../../payment-method/core/application/services/payment-method.service';

@Injectable()
export class DeleteExpenseUseCase {
  constructor(
    @Inject('ExpenseRepository')
    private readonly expenseRepository: IExpenseRepository,
    private readonly prisma: PrismaService,
    private readonly paymentMethodService: PaymentMethodService,
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

    const transaction = await this.prisma.transaction.findUnique({
      where: { id: expense.transactionId },
      select: { paymentMethodId: true },
    });
    const paymentMethodId = transaction?.paymentMethodId;

    // Use Prisma transaction to delete atomically
    await this.prisma.$transaction(async (tx) => {
      await tx.expenseItem.deleteMany({
        where: { expenseId: id },
      });

      await tx.expense.delete({
        where: { id },
      });

      await tx.transaction.delete({
        where: { id: expense.transactionId },
      });
    });

    if (paymentMethodId) {
      await this.paymentMethodService.recalculateBalance(paymentMethodId);
    }
  }
}
