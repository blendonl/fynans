import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
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
  ): Promise<ExpenseItem> {
    await this.validate(dto);

    // Get or create StoreItem
    let itemId: string;
    if (dto.itemId) {
      // Use existing StoreItem
      const existingItem = await this.storeItemService.findById(dto.itemId);
      itemId = existingItem.id;
    } else {
      // Create or find StoreItem
      const storeItem = await this.storeItemService.createOrFind(
        new CreateStoreItemDto(storeId, dto.itemName, dto.itemPrice),
      );
      itemId = storeItem.id;
    }

    // Create ExpenseItem
    const expenseItem = await this.expenseItemRepository.create({
      expenseId: dto.expenseId,
      itemId,
      categoryId: dto.categoryId,
      price: new Decimal(dto.itemPrice),
      discount: new Decimal(dto.discount ?? 0),
    } as Partial<ExpenseItem>);

    return expenseItem;
  }

  private async validate(dto: CreateExpenseItemDto): Promise<void> {
    if (!dto.expenseId || dto.expenseId.trim() === '') {
      throw new BadRequestException('Expense ID is required');
    }

    if (!dto.categoryId || dto.categoryId.trim() === '') {
      throw new BadRequestException('Category ID is required');
    }

    if (!dto.itemName || dto.itemName.trim() === '') {
      throw new BadRequestException('Item name is required');
    }

    if (dto.itemPrice < 0) {
      throw new BadRequestException('Item price must be non-negative');
    }

    if (dto.discount !== undefined && dto.discount < 0) {
      throw new BadRequestException('Discount must be non-negative');
    }

    if (dto.discount !== undefined && dto.discount > dto.itemPrice) {
      throw new BadRequestException('Discount cannot exceed price');
    }

    // Validate category exists
    const category = await this.storeItemCategoryRepository.findById(
      dto.categoryId,
    );
    if (!category) {
      throw new NotFoundException('Store item category not found');
    }

    // Note: We don't validate expense exists here to avoid circular dependency
    // This validation will be handled by the ExpenseService
  }
}
