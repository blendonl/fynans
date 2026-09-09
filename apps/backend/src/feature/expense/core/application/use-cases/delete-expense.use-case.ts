import { Injectable, Inject } from '@nestjs/common';
import {
  DomainNotFoundException,
  DomainForbiddenException,
} from '~common/exceptions/domain.exceptions';
import {
  UNIT_OF_WORK,
  type IUnitOfWork,
} from '~common/persistence/unit-of-work.interface';
import { type IExpenseRepository } from '../../domain/repositories/expense.repository.interface';
import { PaymentMethodService } from '../../../../payment-method/core/application/services/payment-method.service';
import { FamilyBalanceService } from '../../../../family/core/application/services/family-balance.service';

@Injectable()
export class DeleteExpenseUseCase {
  constructor(
    @Inject('ExpenseRepository')
    private readonly expenseRepository: IExpenseRepository,
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
    private readonly paymentMethodService: PaymentMethodService,
    private readonly familyBalanceService: FamilyBalanceService,
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

    await this.unitOfWork.runInTransaction(async () => {
      await this.expenseRepository.deleteWithItemsAndTransaction(
        id,
        expense.transactionId,
      );

      if (familyId) {
        await this.familyBalanceService.recalculateBalances(familyId);
      }
    });

    if (paymentMethodId) {
      await this.paymentMethodService.recalculateBalance(paymentMethodId);
    }
  }
}
