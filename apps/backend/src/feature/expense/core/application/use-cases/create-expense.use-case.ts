import { Injectable, Inject } from '@nestjs/common';
import { type IExpenseRepository } from '../../domain/repositories/expense.repository.interface';
import { CreateTransactionUseCase } from '../../../../transaction/core/application/use-cases/create-transaction.use-case';
import { StoreService } from '../../../../store/core/application/services/store.service';
import { ExpenseItemService } from '../../../../expense-item/core/application/services/expense-item.service';
import { ExpenseCategoryService } from '../../../../expense-category/core/application/services/expense-category.service';
import { NotifyFamilyMembersService } from '~common/services/notify-family-members.service';
import { PrismaService } from '~common/prisma/prisma.service';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { CreateTransactionDto } from '../../../../transaction/core/application/dto/create-transaction.dto';
import { CreateExpenseItemDto } from '../../../../expense-item/core/application/dto/create-expense-item.dto';
import { ExpenseTotalCalculator } from '../../../../expense-item/core/domain/services/expense-total.calculator';
import { Expense } from '../../domain/entities/expense.entity';
import { TransactionType } from '../../../../transaction/core/domain/value-objects/transaction-type.vo';
import { TransactionStatus } from '../../../../transaction/core/domain/value-objects/transaction-status.vo';
import { NotificationType } from '../../../../notification/core/domain/value-objects/notification-type.vo';
import { PaymentMethodService } from '../../../../payment-method/core/application/services/payment-method.service';
import {
  DomainNotFoundException,
  DomainValidationException,
} from '~common/exceptions/domain.exceptions';
import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';
import {
  AuditAction,
  AuditEntity,
  RecordFinancialAuditUseCase,
} from '~common/audit';

@Injectable()
export class CreateExpenseUseCase {
  constructor(
    @Inject('ExpenseRepository')
    private readonly expenseRepository: IExpenseRepository,
    private readonly expenseCategoryService: ExpenseCategoryService,
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly storeService: StoreService,
    private readonly expenseItemService: ExpenseItemService,
    private readonly notifyFamilyMembersService: NotifyFamilyMembersService,
    private readonly paymentMethodService: PaymentMethodService,
    private readonly prisma: PrismaService,
    private readonly recordFinancialAudit: RecordFinancialAuditUseCase,
  ) {}

  async execute(dto: CreateExpenseDto): Promise<Expense> {
    this.validate(dto);

    const category = await this.expenseCategoryService.findById(
      dto.categoryId,
      dto.userId,
    );
    if (!category) {
      throw new DomainNotFoundException('Expense category not found');
    }

    const store =
      category.isConnectedToStore || dto.storeId
        ? await this.storeService.resolveStore({
            storeId: dto.storeId,
            storeName: dto.storeName,
            storeLocation: dto.storeLocation,
            userId: dto.userId,
          })
        : null;

    const suppliedItems = dto.items?.length ? dto.items : undefined;

    if (suppliedItems && !store) {
      throw new DomainValidationException(
        'A store is required to record an itemised expense',
      );
    }

    const items =
      suppliedItems ??
      (store
        ? [
            new CreateExpenseItemDto({
              expenseId: '',
              categoryId: dto.categoryId,
              itemName: dto.note?.trim() || category.name,
              itemPrice: dto.amount!.toNumber(),
            }),
          ]
        : []);

    const totalValue = suppliedItems
      ? ExpenseTotalCalculator.total(
          suppliedItems.map((item) => ({
            price: item.itemPrice,
            discount: item.discount,
            quantity: item.quantity,
          })),
        )
      : dto.amount!;

    const status = dto.status ?? TransactionStatus.CONFIRMED;
    const isPending = status === TransactionStatus.PENDING;

    const expenseId = await this.prisma.runInTransaction(async () => {
      const transaction = await this.createTransactionUseCase.execute(
        new CreateTransactionDto(
          dto.userId,
          TransactionType.EXPENSE,
          totalValue,
          dto.recordedAt,
          dto.familyId,
          dto.paymentMethodId,
          status,
        ),
      );

      const expense = await this.expenseRepository.create({
        transactionId: transaction.id,
        storeId: store?.id,
        categoryId: dto.categoryId,
      });

      for (const item of items) {
        await this.expenseItemService.create(
          new CreateExpenseItemDto({
            expenseId: expense.id,
            categoryId: item.categoryId,
            itemName: item.itemName,
            itemPrice: item.itemPrice,
            discount: item.discount,
            quantity: item.quantity,
            itemId: item.itemId,
            sizeValue: item.sizeValue,
            sizeUnit: item.sizeUnit,
          }),
          store!.id,
          dto.userId,
        );
      }

      return expense.id;
    });

    await this.recordFinancialAudit.execute({
      entity: AuditEntity.EXPENSE,
      entityId: expenseId,
      action: AuditAction.CREATED,
      actorId: dto.userId,
      familyId: dto.familyId,
      changes: {
        categoryId: dto.categoryId,
        storeId: store?.id ?? null,
        value: totalValue.toFixed(2),
        status,
      },
    });

    if (dto.familyId) {
      await this.prisma.afterCommit(() =>
        this.notifyFamilyMembersService.notify({
          familyId: dto.familyId!,
          actorUserId: dto.userId,
          type: isPending
            ? NotificationType.TRANSACTION_PENDING_CREATED
            : NotificationType.FAMILY_EXPENSE_CREATED,
          data: {
            expenseId,
            amount: totalValue.toFixed(2),
          },
        }),
      );
    }

    if (dto.paymentMethodId && !isPending) {
      await this.prisma.afterCommit(() =>
        this.paymentMethodService.recalculateBalance(dto.paymentMethodId!),
      );
    }

    return this.expenseRepository.findById(expenseId) as Promise<Expense>;
  }

  private validate(dto: CreateExpenseDto): void {
    if (!dto.userId || dto.userId.trim() === '') {
      throw new DomainValidationException('User ID is required');
    }

    if (!dto.categoryId || dto.categoryId.trim() === '') {
      throw new DomainValidationException('Category ID is required');
    }

    const hasItems = dto.items && dto.items.length > 0;
    const hasAmount =
      dto.amount !== undefined && dto.amount.greaterThan(new Decimal(0));

    if (!hasItems && !hasAmount) {
      throw new DomainValidationException(
        'Either items or an amount is required',
      );
    }

    if (dto.items) {
      for (const item of dto.items) {
        if (item.itemPrice < 0) {
          throw new DomainValidationException(
            'Item price must be non-negative',
          );
        }
        if (item.discount !== undefined && item.discount < 0) {
          throw new DomainValidationException(
            'Item discount must be non-negative',
          );
        }
        if (item.discount !== undefined && item.discount > item.itemPrice) {
          throw new DomainValidationException(
            'Item discount cannot exceed price',
          );
        }
      }
    }
  }
}
