import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { type IExpenseItemRepository } from '../../domain/repositories/expense-item.repository.interface';
import { type IStoreItemCategoryRepository } from '../../../../store-item-category/core/domain/repositories/store-item-category.repository.interface';
import { UpdateExpenseItemDto } from '../dto/update-expense-item.dto';
import { ExpenseItem } from '../../domain/entities/expense-item.entity';
import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';

@Injectable()
export class UpdateExpenseItemUseCase {
  constructor(
    @Inject('ExpenseItemRepository')
    private readonly expenseItemRepository: IExpenseItemRepository,
    @Inject('StoreItemCategoryRepository')
    private readonly storeItemCategoryRepository: IStoreItemCategoryRepository,
  ) {}

  async execute(id: string, dto: UpdateExpenseItemDto): Promise<ExpenseItem> {
    const item = await this.expenseItemRepository.findById(id);

    if (!item) {
      throw new NotFoundException('Expense item not found');
    }

    await this.validate(dto);

    const updated = await this.expenseItemRepository.update(id, {
      categoryId: dto.categoryId,
      price: dto.price !== undefined ? new Decimal(dto.price) : undefined,
      discount: dto.discount !== undefined ? new Decimal(dto.discount) : undefined,
    } as Partial<ExpenseItem>);

    return updated;
  }

  private async validate(dto: UpdateExpenseItemDto): Promise<void> {
    if (dto.price !== undefined && dto.price < 0) {
      throw new BadRequestException('Price must be non-negative');
    }

    if (dto.discount !== undefined && dto.discount < 0) {
      throw new BadRequestException('Discount must be non-negative');
    }

    // Validate category exists if changed
    if (dto.categoryId) {
      const category = await this.storeItemCategoryRepository.findById(
        dto.categoryId,
      );
      if (!category) {
        throw new NotFoundException('Store item category not found');
      }
    }
  }
}
