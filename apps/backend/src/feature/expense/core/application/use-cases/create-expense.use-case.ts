import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { type IExpenseRepository } from '../../domain/repositories/expense.repository.interface';
import { type IExpenseCategoryRepository } from '../../../../expense-category/core/domain/repositories/expense-category.repository.interface';
import { type IFamilyRepository } from '../../../../family/core/domain/repositories/family.repository.interface';
import { TransactionService } from '../../../../transaction/core/application/services/transaction.service';
import { StoreService } from '../../../../store/core/application/services/store.service';
import { ExpenseItemService } from '../../../../expense-item/core/application/services/expense-item.service';
import { CreateNotificationUseCase } from '../../../../notification/core/application/use-cases/create-notification.use-case';
import { UserService } from '../../../../user/core/application/services/user.service';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { CreateTransactionDto } from '../../../../transaction/core/application/dto/create-transaction.dto';
import { CreateStoreDto } from '../../../../store/core/application/dto/create-store.dto';
import { CreateExpenseItemDto } from '../../../../expense-item/core/application/dto/create-expense-item.dto';
import { Expense } from '../../domain/entities/expense.entity';
import { TransactionType } from '../../../../transaction/core/domain/value-objects/transaction-type.vo';
import {
  NotificationType,
  DeliveryMethod,
  NotificationPriority,
} from '../../../../notification/core/domain/value-objects/notification-type.vo';
import { v4 as uuid } from 'uuid';

@Injectable()
export class CreateExpenseUseCase {
  constructor(
    @Inject('ExpenseRepository')
    private readonly expenseRepository: IExpenseRepository,
    @Inject('ExpenseCategoryRepository')
    private readonly expenseCategoryRepository: IExpenseCategoryRepository,
    @Inject('FamilyRepository')
    private readonly familyRepository: IFamilyRepository,
    private readonly transactionService: TransactionService,
    private readonly storeService: StoreService,
    private readonly expenseItemService: ExpenseItemService,
    private readonly createNotificationUseCase: CreateNotificationUseCase,
    private readonly userService: UserService,
  ) {}

  async execute(dto: CreateExpenseDto): Promise<Expense> {
    await this.validate(dto);

    const category = await this.expenseCategoryRepository.findById(
      dto.categoryId,
    );
    if (!category) {
      throw new NotFoundException('Expense category not found');
    }

    let store = null;

    console.log('Category isConnectedToStore:', category);
    if (category.isConnectedToStore) {
      if (!dto.storeName || !dto.storeLocation) {
        throw new BadRequestException(
          'Store information is required for this category',
        );
      }
      store = await this.storeService.createOrFind(
        new CreateStoreDto(dto.storeName, dto.storeLocation),
      );
    }

    const totalValue = dto.items.reduce((sum, item) => {
      const itemPrice = item.itemPrice;
      const discount = item.discount ?? 0;
      return sum + (itemPrice * (item.quantity ?? 1) - discount);
    }, 0);

    const transaction = await this.transactionService.create(
      new CreateTransactionDto(
        dto.userId,
        TransactionType.EXPENSE,
        totalValue,
        dto.recordedAt,
        dto.familyId,
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
        dto.items.map((item) =>
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
          ),
        ),
      );
    }

    if (dto.familyId) {
      const family = await this.familyRepository.findById(dto.familyId);
      const expenseUser = await this.userService.findById(dto.userId);
      const allMembers = await this.familyRepository.findMembers(dto.familyId);

      for (const familyMember of allMembers) {
        if (familyMember.userId === dto.userId) continue;

        await this.createNotificationUseCase.execute({
          userId: familyMember.userId,
          type: NotificationType.FAMILY_EXPENSE_CREATED,
          data: {
            expenseId: expense.id,
            familyId: dto.familyId,
            familyName: family?.name,
            userName: expenseUser?.fullName,
            amount: totalValue.toFixed(2),
          },
          deliveryMethods: [DeliveryMethod.IN_APP, DeliveryMethod.PUSH],
          priority: NotificationPriority.LOW,
          familyId: dto.familyId,
        });
      }
    }

    return this.expenseRepository.findById(expense.id) as Promise<Expense>;
  }

  private async validate(dto: CreateExpenseDto): Promise<void> {
    if (!dto.userId || dto.userId.trim() === '') {
      throw new BadRequestException('User ID is required');
    }

    if (!dto.categoryId || dto.categoryId.trim() === '') {
      throw new BadRequestException('Category ID is required');
    }

    const category = await this.expenseCategoryRepository.findById(
      dto.categoryId,
    );

    if (category?.isConnectedToStore) {
      if (!dto.storeName || dto.storeName.trim() === '') {
        throw new BadRequestException(
          'Store name is required for this category',
        );
      }

      if (!dto.storeLocation || dto.storeLocation.trim() === '') {
        throw new BadRequestException(
          'Store location is required for this category',
        );
      }
    }

    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('At least one item is required');
    }

    for (const item of dto.items) {
      if (item.itemPrice < 0) {
        throw new BadRequestException('Item price must be non-negative');
      }
      if (item.discount !== undefined && item.discount < 0) {
        throw new BadRequestException('Item discount must be non-negative');
      }
      if (item.discount !== undefined && item.discount > item.itemPrice) {
        throw new BadRequestException('Item discount cannot exceed price');
      }
    }
  }
}
