import { Injectable, Inject } from '@nestjs/common';
import {
  DomainNotFoundException,
  DomainForbiddenException,
} from '~common/exceptions/domain.exceptions';
import { type IExpenseRepository } from '../../domain/repositories/expense.repository.interface';
import { type ITransactionRepository } from '~feature/transaction/core/domain/repositories/transaction.repository.interface';
import { Transaction } from '~feature/transaction/core/domain/entities/transaction.entity';
import { UpdateExpenseDto } from '../dto/update-expense.dto';
import { type IExpenseCategoryRepository } from '../../../../expense-category/core/domain/repositories/expense-category.repository.interface';
import { Expense } from '../../domain/entities/expense.entity';
import { StoreService } from '~feature/store/core';
import { PaymentMethodService } from '~feature/payment-method/core/application/services/payment-method.service';
import { FamilyBalanceService } from '~feature/family/core/application/services/family-balance.service';
import { PrismaService } from '~common/prisma/prisma.service';
import {
  AuditAction,
  AuditEntity,
  RecordFinancialAuditUseCase,
} from '~common/audit';

@Injectable()
export class UpdateExpenseUseCase {
  constructor(
    @Inject('ExpenseRepository')
    private readonly expenseRepository: IExpenseRepository,
    @Inject('ExpenseCategoryRepository')
    private readonly expenseCategoryRepository: IExpenseCategoryRepository,
    @Inject('TransactionRepository')
    private readonly transactionRepository: ITransactionRepository,
    @Inject()
    private readonly storeService: StoreService,
    private readonly paymentMethodService: PaymentMethodService,
    private readonly familyBalanceService: FamilyBalanceService,
    private readonly prisma: PrismaService,
    private readonly recordFinancialAudit: RecordFinancialAuditUseCase,
  ) {}

  async execute(
    id: string,
    userId: string,
    dto: UpdateExpenseDto,
  ): Promise<Expense> {
    const expense = await this.expenseRepository.findById(id);

    if (!expense) {
      throw new DomainNotFoundException('Expense not found');
    }

    const isOwner = await this.expenseRepository.verifyOwnership(id, userId);
    if (!isOwner) {
      throw new DomainForbiddenException('Access denied');
    }

    if (dto.paymentMethodId) {
      await this.paymentMethodService.verifyOwnership(
        dto.paymentMethodId,
        userId,
      );
    }

    await this.validate(dto);

    const updated = await this.expenseRepository.update(id, {
      categoryId: dto.categoryId,
      storeId: dto.storeId,
      description: dto.note,
    });

    await this.recordFinancialAudit.execute({
      entity: AuditEntity.EXPENSE,
      entityId: id,
      action: AuditAction.UPDATED,
      actorId: userId,
      transactionId: expense.transactionId,
      familyId: expense.transaction.familyId,
      changes: this.changeSet(dto),
    });

    const txUpdates: Record<string, unknown> = {};
    if (dto.amount !== undefined) txUpdates.value = dto.amount;
    if (dto.recordedAt !== undefined) txUpdates.recordedAt = dto.recordedAt;
    if (dto.paymentMethodId !== undefined)
      txUpdates.paymentMethodId = dto.paymentMethodId ?? undefined;

    if (Object.keys(txUpdates).length === 0) {
      return updated;
    }

    const previousPaymentMethodId = expense.transaction.paymentMethodId;
    const familyId = expense.transaction.familyId;

    await this.prisma.runInTransaction(async () => {
      await this.transactionRepository.update(
        expense.transactionId,
        txUpdates as Partial<Transaction>,
      );

      if (familyId) {
        await this.familyBalanceService.recalculateBalances(familyId);
      }
    });

    const affectedPaymentMethods = new Set(
      [previousPaymentMethodId, dto.paymentMethodId ?? undefined].filter(
        (paymentMethodId): paymentMethodId is string =>
          Boolean(paymentMethodId),
      ),
    );

    for (const paymentMethodId of affectedPaymentMethods) {
      await this.paymentMethodService.recalculateBalance(paymentMethodId);
    }

    return (await this.expenseRepository.findById(id))!;
  }

  private changeSet(dto: UpdateExpenseDto): Record<string, unknown> {
    const changes: Record<string, unknown> = {};

    if (dto.categoryId !== undefined) changes.categoryId = dto.categoryId;
    if (dto.storeId !== undefined) changes.storeId = dto.storeId;
    if (dto.note !== undefined) changes.note = dto.note;
    if (dto.amount !== undefined) changes.value = dto.amount.toFixed(2);
    if (dto.recordedAt !== undefined)
      changes.recordedAt = dto.recordedAt.toISOString();
    if (dto.paymentMethodId !== undefined)
      changes.paymentMethodId = dto.paymentMethodId;

    return changes;
  }

  private async validate(dto: UpdateExpenseDto): Promise<void> {
    if (dto.categoryId) {
      const category = await this.expenseCategoryRepository.findById(
        dto.categoryId,
      );
      if (!category) {
        throw new DomainNotFoundException('Expense category not found');
      }
    }

    if (dto.storeId) {
      const store = await this.storeService.findById(dto.storeId);
      if (!store) {
        throw new DomainNotFoundException('Store not found');
      }
    }
  }
}
