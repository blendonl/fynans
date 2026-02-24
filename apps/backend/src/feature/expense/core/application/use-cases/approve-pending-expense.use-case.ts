import { Injectable, Inject } from '@nestjs/common';
import { type IExpenseRepository } from '../../domain/repositories/expense.repository.interface';
import { type ITransactionRepository } from '../../../../transaction/core/domain/repositories/transaction.repository.interface';
import { PaymentMethodService } from '../../../../payment-method/core/application/services/payment-method.service';
import { ExpenseAuthService } from '../services/expense-auth.service';
import { NotifyFamilyMembersService } from '~common/services/notify-family-members.service';
import { CreateNotificationUseCase } from '../../../../notification/core/application/use-cases/create-notification.use-case';
import { FamilyBalanceService } from '../../../../family/core/application/services/family-balance.service';
import { Expense } from '../../domain/entities/expense.entity';
import { TransactionStatus } from '../../../../transaction/core/domain/value-objects/transaction-status.vo';
import {
  NotificationType,
  NotificationPriority,
  DeliveryMethod,
} from '../../../../notification/core/domain/value-objects/notification-type.vo';
import {
  DomainNotFoundException,
  DomainValidationException,
} from '~common/exceptions/domain.exceptions';

@Injectable()
export class ApprovePendingExpenseUseCase {
  constructor(
    @Inject('ExpenseRepository')
    private readonly expenseRepository: IExpenseRepository,
    @Inject('TransactionRepository')
    private readonly transactionRepository: ITransactionRepository,
    private readonly expenseAuthService: ExpenseAuthService,
    private readonly familyBalanceService: FamilyBalanceService,
    private readonly paymentMethodService: PaymentMethodService,
    private readonly notifyFamilyMembersService: NotifyFamilyMembersService,
    private readonly createNotificationUseCase: CreateNotificationUseCase,
  ) {}

  async execute(expenseId: string, userId: string): Promise<Expense> {
    const expense = await this.expenseRepository.findById(expenseId);
    if (!expense) {
      throw new DomainNotFoundException('Expense not found');
    }

    const transaction = expense.transaction;
    if (!transaction.isPending()) {
      throw new DomainValidationException('Only pending expenses can be approved');
    }

    await this.expenseAuthService.verifyTransactionAccess(transaction, userId);

    const updatedTransaction = await this.transactionRepository.updateStatus(
      transaction.id,
      TransactionStatus.CONFIRMED,
    );

    // Run balance updates (same as direct add)
    if (transaction.familyId) {
      await this.familyBalanceService.updateBalancesAfterTransaction(
        transaction.familyId,
        transaction.userId,
        updatedTransaction,
      );

      await this.notifyFamilyMembersService.notify({
        familyId: transaction.familyId,
        actorUserId: userId,
        type: NotificationType.FAMILY_EXPENSE_CREATED,
        data: {
          expenseId: expense.id,
          amount: transaction.value.toNumber().toFixed(2),
        },
      });
    }

    if (transaction.paymentMethodId) {
      await this.paymentMethodService.recalculateBalance(transaction.paymentMethodId);
    }

    if (userId !== transaction.userId) {
      await this.createNotificationUseCase.execute({
        userId: transaction.userId,
        type: NotificationType.TRANSACTION_APPROVED,
        data: {
          expenseId: expense.id,
          amount: transaction.value.toNumber().toFixed(2),
        },
        deliveryMethods: [DeliveryMethod.IN_APP, DeliveryMethod.PUSH],
        priority: NotificationPriority.MEDIUM,
        transactionId: transaction.id,
      });
    }

    return this.expenseRepository.findById(expenseId) as Promise<Expense>;
  }
}
