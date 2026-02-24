import { Injectable, Inject } from '@nestjs/common';
import { DomainNotFoundException } from '~common/exceptions/domain.exceptions';
import { type IExpenseItemRepository } from '../../domain/repositories/expense-item.repository.interface';
import { type IStoreItemCategoryRepository } from '../../../../store-item-category/core/domain/repositories/store-item-category.repository.interface';
import { StoreItemService } from '../../../../store/core/application/services/store-item.service';
import { CreateExpenseItemDto } from '../dto/create-expense-item.dto';
import { CreateStoreItemDto } from '../../../../store/core/application/dto/create-store-item.dto';
import { ExpenseItem } from '../../domain/entities/expense-item.entity';
import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';

@Injectable()
export class CreateExpenseItemUseCase {
  constructor(
    @Inject('ExpenseItemRepository')
    private readonly expenseItemRepository: IExpenseItemRepository,
    @Inject('StoreItemCategoryRepository')
    private readonly storeItemCategoryRepository: IStoreItemCategoryRepository,
    private readonly storeItemService: StoreItemService,
  ) {}

  async execute(
    dto: CreateExpenseItemDto,
    storeId: string,
    userId: string,
  ): Promise<ExpenseItem> {
    await this.validate(dto);

    let itemId: string;
    if (dto.itemId) {
      const existingItem = await this.storeItemService.findById(dto.itemId);
      itemId = existingItem.id;
    } else {
      const storeItem = await this.storeItemService.createOrFind(
        new CreateStoreItemDto(
          storeId,
          dto.itemName,
          dto.itemPrice,
          dto.categoryId,
          undefined,
          dto.sizeValue,
          dto.sizeUnit,
        ),
        userId,
      );
      itemId = storeItem.id;
    }

    await this.storeItemCategoryRepository.linkToUser(dto.categoryId, userId);

    const expenseItem = await this.expenseItemRepository.create({
      expenseId: dto.expenseId,
      itemId,
      price: new Decimal(dto.itemPrice),
      discount: new Decimal(dto.discount ?? 0),
      quantity: new Decimal(dto.quantity ?? 1),
    });

    return expenseItem;
  }

  private async validate(dto: CreateExpenseItemDto): Promise<void> {
    const category = await this.storeItemCategoryRepository.findById(
      dto.categoryId,
    );

    if (!category) {
      throw new DomainNotFoundException('Store item category not found');
    }
  }
}
