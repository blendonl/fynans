import { Injectable, Inject } from '@nestjs/common';
import { type IExpenseRepository } from '../../domain/repositories/expense.repository.interface';
import { type ITransactionRepository } from '../../../../transaction/core/domain/repositories/transaction.repository.interface';
import { FamilyService } from '../../../../family/core/application/services/family.service';
import { CreateNotificationUseCase } from '../../../../notification/core/application/use-cases/create-notification.use-case';
import { Expense } from '../../domain/entities/expense.entity';
import { TransactionStatus } from '../../../../transaction/core/domain/value-objects/transaction-status.vo';
import {
  NotificationType,
  NotificationPriority,
  DeliveryMethod,
} from '../../../../notification/core/domain/value-objects/notification-type.vo';
import {
  DomainNotFoundException,
  DomainForbiddenException,
  DomainValidationException,
} from '~common/exceptions/domain.exceptions';

@Injectable()
export class RejectPendingExpenseUseCase {
  constructor(
    @Inject('ExpenseRepository')
    private readonly expenseRepository: IExpenseRepository,
    @Inject('TransactionRepository')
    private readonly transactionRepository: ITransactionRepository,
    private readonly familyService: FamilyService,
    private readonly createNotificationUseCase: CreateNotificationUseCase,
  ) {}

  async execute(
    expenseId: string,
    userId: string,
    rejectionReason: string,
  ): Promise<Expense> {
    const expense = await this.expenseRepository.findById(expenseId);
    if (!expense) {
      throw new DomainNotFoundException('Expense not found');
    }

    const transaction = expense.transaction;
    if (!transaction.isPending()) {
      throw new DomainValidationException('Only pending expenses can be rejected');
    }

    // Auth check: personal = creator only, family = any member
    if (transaction.familyId) {
      const member = await this.familyService.findMember(transaction.familyId, userId);
      if (!member) {
        throw new DomainForbiddenException('Not a member of this family');
      }
    } else {
      if (transaction.userId !== userId) {
        throw new DomainForbiddenException('Access denied');
      }
    }

    // Update status to REJECTED with reason
    await this.transactionRepository.updateStatus(
      transaction.id,
      TransactionStatus.REJECTED,
      rejectionReason,
    );

    // Notify creator if rejector is different
    if (userId !== transaction.userId) {
      await this.createNotificationUseCase.execute({
        userId: transaction.userId,
        type: NotificationType.TRANSACTION_REJECTED,
        data: {
          expenseId: expense.id,
          amount: transaction.value.toNumber().toFixed(2),
          rejectionReason,
        },
        deliveryMethods: [DeliveryMethod.IN_APP, DeliveryMethod.PUSH],
        priority: NotificationPriority.MEDIUM,
        transactionId: transaction.id,
      });
    }

    return this.expenseRepository.findById(expenseId) as Promise<Expense>;
  }
}
