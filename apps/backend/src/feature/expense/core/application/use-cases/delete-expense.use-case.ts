import { Injectable, Inject } from '@nestjs/common';
import {
  DomainNotFoundException,
  DomainForbiddenException,
} from '~common/exceptions/domain.exceptions';
import { PrismaService } from '../../../../../common/prisma/prisma.service';
import { type IExpenseRepository } from '../../domain/repositories/expense.repository.interface';
import { type ITransactionRepository } from '../../../../transaction/core/domain/repositories/transaction.repository.interface';
import { PaymentMethodService } from '../../../../payment-method/core/application/services/payment-method.service';
import { FamilyBalanceService } from '../../../../family/core/application/services/family-balance.service';
import {
  AuditAction,
  AuditEntity,
  RecordFinancialAuditUseCase,
} from '~common/audit';

@Injectable()
export class DeleteExpenseUseCase {
  constructor(
    @Inject('ExpenseRepository')
    private readonly expenseRepository: IExpenseRepository,
    @Inject('TransactionRepository')
    private readonly transactionRepository: ITransactionRepository,
    private readonly prisma: PrismaService,
    private readonly paymentMethodService: PaymentMethodService,
    private readonly familyBalanceService: FamilyBalanceService,
    private readonly recordFinancialAudit: RecordFinancialAuditUseCase,
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

    const transaction = expense.transaction;
    const paymentMethodId = transaction.paymentMethodId;
    const familyId = transaction.familyId;

    await this.prisma.runInTransaction(async () => {
      await this.expenseRepository.delete(id);
      await this.transactionRepository.delete(expense.transactionId);

      if (familyId) {
        await this.familyBalanceService.recalculateBalances(familyId);
      }
    });

    await this.recordFinancialAudit.execute({
      entity: AuditEntity.EXPENSE,
      entityId: id,
      action: AuditAction.DELETED,
      actorId: userId,
      transactionId: expense.transactionId,
      familyId,
      changes: { value: transaction.value.toFixed(2) },
    });

    if (paymentMethodId) {
      await this.paymentMethodService.recalculateBalance(paymentMethodId);
    }
  }
}
