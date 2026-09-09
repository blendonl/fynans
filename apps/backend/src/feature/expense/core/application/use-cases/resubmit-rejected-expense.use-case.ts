import { Injectable, Inject } from '@nestjs/common';
import { type IExpenseRepository } from '../../domain/repositories/expense.repository.interface';
import { type ITransactionRepository } from '../../../../transaction/core/domain/repositories/transaction.repository.interface';
import { Transaction } from '../../../../transaction/core/domain/entities/transaction.entity';
import { NotifyFamilyMembersService } from '~common/services/notify-family-members.service';
import { PaymentMethodService } from '~feature/payment-method/core/application/services/payment-method.service';
import { Expense } from '../../domain/entities/expense.entity';
import { ResubmitExpenseDto } from '../dto/resubmit-expense.dto';
import { TransactionStatus } from '../../../../transaction/core/domain/value-objects/transaction-status.vo';
import { NotificationType } from '../../../../notification/core/domain/value-objects/notification-type.vo';
import {
  DomainNotFoundException,
  DomainForbiddenException,
  DomainValidationException,
} from '~common/exceptions/domain.exceptions';
import {
  AuditAction,
  AuditEntity,
  RecordFinancialAuditUseCase,
} from '~common/audit';

@Injectable()
export class ResubmitRejectedExpenseUseCase {
  constructor(
    @Inject('ExpenseRepository')
    private readonly expenseRepository: IExpenseRepository,
    @Inject('TransactionRepository')
    private readonly transactionRepository: ITransactionRepository,
    private readonly notifyFamilyMembersService: NotifyFamilyMembersService,
    private readonly paymentMethodService: PaymentMethodService,
    private readonly recordFinancialAudit: RecordFinancialAuditUseCase,
  ) {}

  async execute(
    expenseId: string,
    userId: string,
    dto?: ResubmitExpenseDto,
  ): Promise<Expense> {
    const expense = await this.expenseRepository.findById(expenseId);
    if (!expense) {
      throw new DomainNotFoundException('Expense not found');
    }

    const transaction = expense.transaction;
    if (!transaction.isRejected()) {
      throw new DomainValidationException(
        'Only rejected expenses can be re-submitted',
      );
    }

    if (transaction.userId !== userId) {
      throw new DomainForbiddenException(
        'Only the creator can re-submit a rejected expense',
      );
    }

    if (dto?.paymentMethodId) {
      await this.paymentMethodService.verifyOwnership(
        dto.paymentMethodId,
        userId,
      );
    }

    if (dto?.categoryId) {
      await this.expenseRepository.update(expenseId, {
        categoryId: dto.categoryId,
      });
    }

    const transactionUpdates: Record<string, unknown> = {};
    if (dto?.amount !== undefined) {
      transactionUpdates.value = dto.amount;
    }
    if (dto?.recordedAt !== undefined) {
      transactionUpdates.recordedAt = dto.recordedAt;
    }
    if (dto?.paymentMethodId !== undefined) {
      transactionUpdates.paymentMethodId = dto.paymentMethodId ?? undefined;
    }

    if (Object.keys(transactionUpdates).length > 0) {
      await this.transactionRepository.update(
        transaction.id,
        transactionUpdates as Partial<Transaction>,
      );
    }

    await this.transactionRepository.updateStatus(
      transaction.id,
      TransactionStatus.PENDING,
    );

    await this.recordFinancialAudit.execute({
      entity: AuditEntity.EXPENSE,
      entityId: expense.id,
      action: AuditAction.RESUBMITTED,
      actorId: userId,
      transactionId: transaction.id,
      familyId: transaction.familyId,
      changes: transactionUpdates,
    });

    if (transaction.familyId) {
      await this.notifyFamilyMembersService.notify({
        familyId: transaction.familyId,
        actorUserId: userId,
        type: NotificationType.TRANSACTION_PENDING_CREATED,
        data: {
          expenseId: expense.id,
          amount: transaction.value.toNumber().toFixed(2),
        },
      });
    }

    return this.expenseRepository.findById(expenseId) as Promise<Expense>;
  }
}
