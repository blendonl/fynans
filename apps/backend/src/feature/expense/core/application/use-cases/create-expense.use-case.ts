import { Injectable, Inject } from '@nestjs/common';
import { type IExpenseRepository } from '../../domain/repositories/expense.repository.interface';
import { TransactionService } from '../../../../transaction/core/application/services/transaction.service';
import { StoreService } from '../../../../store/core/application/services/store.service';
import { ExpenseItemService } from '../../../../expense-item/core/application/services/expense-item.service';
import { ExpenseCategoryService } from '../../../../expense-category/core/application/services/expense-category.service';
import { NotifyFamilyMembersService } from '~common/services/notify-family-members.service';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { CreateTransactionDto } from '../../../../transaction/core/application/dto/create-transaction.dto';
import { CreateStoreDto } from '../../../../store/core/application/dto/create-store.dto';
import { CreateExpenseItemDto } from '../../../../expense-item/core/application/dto/create-expense-item.dto';
import { Expense } from '../../domain/entities/expense.entity';
import { TransactionType } from '../../../../transaction/core/domain/value-objects/transaction-type.vo';
import { TransactionStatus } from '../../../../transaction/core/domain/value-objects/transaction-status.vo';
import { NotificationType } from '../../../../notification/core/domain/value-objects/notification-type.vo';
import { PaymentMethodService } from '../../../../payment-method/core/application/services/payment-method.service';
import {
  DomainNotFoundException,
  DomainValidationException,
} from '~common/exceptions/domain.exceptions';
import { v4 as uuid } from 'uuid';

@Injectable()
export class CreateExpenseUseCase {
  constructor(
    @Inject('ExpenseRepository')
    private readonly expenseRepository: IExpenseRepository,
    private readonly expenseCategoryService: ExpenseCategoryService,
    private readonly transactionService: TransactionService,
    private readonly storeService: StoreService,
    private readonly expenseItemService: ExpenseItemService,
    private readonly notifyFamilyMembersService: NotifyFamilyMembersService,
    private readonly paymentMethodService: PaymentMethodService,
  ) {}

  async execute(dto: CreateExpenseDto): Promise<Expense> {
    this.validate(dto);

    const category = await this.expenseCategoryService.findById(dto.categoryId);
    if (!category) {
      throw new DomainNotFoundException('Expense category not found');
    }

    await this.expenseCategoryService.linkToUser(dto.categoryId, dto.userId);

    // Synthesize a single item for simple (non-itemized) mode
    const items = dto.items ?? [
      new CreateExpenseItemDto({
        expenseId: '',
        categoryId: dto.categoryId,
        itemName: dto.note?.trim() || category.name,
        itemPrice: dto.amount!,
      }),
    ];

    let store = null;

    if (dto.storeId) {
      store = await this.storeService.findById(dto.storeId);
    } else if (category.isConnectedToStore && dto.storeName && dto.storeLocation) {
      store = await this.storeService.createOrFind(
        new CreateStoreDto(dto.storeName, dto.storeLocation),
        dto.userId,
      );
    }

    const totalValue = items.reduce((sum, item) => {
      const itemPrice = item.itemPrice;
      const discount = item.discount ?? 0;
      return sum + (itemPrice * (item.quantity ?? 1) - discount);
    }, 0);

    const status = dto.status ?? TransactionStatus.CONFIRMED;
    const isPending = status === TransactionStatus.PENDING;

    const transaction = await this.transactionService.create(
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

    const expenseId = uuid();
    const expense = await this.expenseRepository.create({
      id: expenseId,
      transactionId: transaction.id,
      storeId: store?.id,
      categoryId: dto.categoryId,
    } as Partial<Expense>);

    if (store) {
      await Promise.all(
        items.map((item) =>
          this.expenseItemService.create(
            new CreateExpenseItemDto({
              expenseId: expense.id,
              categoryId: item.categoryId,
              itemName: item.itemName,
              itemPrice: item.itemPrice,
              discount: item.discount,
              quantity: item.quantity,
            }),
            store.id,
            dto.userId,
          ),
        ),
      );
    }

    if (dto.familyId) {
      if (isPending) {
        // Notify family that a pending expense was created (for review)
        await this.notifyFamilyMembersService.notify({
          familyId: dto.familyId,
          actorUserId: dto.userId,
          type: NotificationType.TRANSACTION_PENDING_CREATED,
          data: {
            expenseId: expense.id,
            amount: totalValue.toFixed(2),
          },
        });
      } else {
        await this.notifyFamilyMembersService.notify({
          familyId: dto.familyId,
          actorUserId: dto.userId,
          type: NotificationType.FAMILY_EXPENSE_CREATED,
          data: {
            expenseId: expense.id,
            amount: totalValue.toFixed(2),
          },
        });
      }
    }

    // Only recalculate balance for confirmed transactions
    if (dto.paymentMethodId && !isPending) {
      await this.paymentMethodService.recalculateBalance(dto.paymentMethodId);
    }

    return this.expenseRepository.findById(expense.id) as Promise<Expense>;
  }

  private validate(dto: CreateExpenseDto): void {
    if (!dto.userId || dto.userId.trim() === '') {
      throw new DomainValidationException('User ID is required');
    }

    if (!dto.categoryId || dto.categoryId.trim() === '') {
      throw new DomainValidationException('Category ID is required');
    }

    const hasItems = dto.items && dto.items.length > 0;
    const hasAmount = dto.amount !== undefined && dto.amount > 0;

    if (!hasItems && !hasAmount) {
      throw new DomainValidationException(
        'Either items or an amount is required',
      );
    }

    if (dto.items) {
      for (const item of dto.items) {
        if (item.itemPrice < 0) {
          throw new DomainValidationException('Item price must be non-negative');
        }
        if (item.discount !== undefined && item.discount < 0) {
          throw new DomainValidationException('Item discount must be non-negative');
        }
        if (item.discount !== undefined && item.discount > item.itemPrice) {
          throw new DomainValidationException('Item discount cannot exceed price');
        }
      }
    }
  }
}
