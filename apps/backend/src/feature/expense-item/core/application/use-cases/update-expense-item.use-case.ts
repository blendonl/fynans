import { Injectable, Inject } from '@nestjs/common';
import {
  DomainNotFoundException,
  DomainValidationException,
} from '~common/exceptions/domain.exceptions';
import { type IExpenseItemRepository } from '../../domain/repositories/expense-item.repository.interface';
import { type IStoreItemCategoryRepository } from '../../../../store-item-category/core/domain/repositories/store-item-category.repository.interface';
import { UpdateExpenseItemDto } from '../dto/update-expense-item.dto';
import { ExpenseItem } from '../../domain/entities/expense-item.entity';
import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';
import { PrismaService } from '~common/prisma/prisma.service';
import { SyncExpenseTotalUseCase } from './sync-expense-total.use-case';

@Injectable()
export class UpdateExpenseItemUseCase {
  constructor(
    @Inject('ExpenseItemRepository')
    private readonly expenseItemRepository: IExpenseItemRepository,
    @Inject('StoreItemCategoryRepository')
    private readonly storeItemCategoryRepository: IStoreItemCategoryRepository,
    private readonly syncExpenseTotalUseCase: SyncExpenseTotalUseCase,
    private readonly prisma: PrismaService,
  ) {}

  async execute(id: string, dto: UpdateExpenseItemDto): Promise<ExpenseItem> {
    const item = await this.expenseItemRepository.findById(id);

    if (!item) {
      throw new DomainNotFoundException('Expense item not found');
    }

    await this.validate(dto);

    return this.prisma.runInTransaction(async () => {
      const updated = await this.expenseItemRepository.update(id, {
        categoryId: dto.categoryId,
        price: dto.price !== undefined ? new Decimal(dto.price) : undefined,
        discount:
          dto.discount !== undefined ? new Decimal(dto.discount) : undefined,
      });

      await this.syncExpenseTotalUseCase.execute(item.expenseId);

      return updated;
    });
  }

  private async validate(dto: UpdateExpenseItemDto): Promise<void> {
    if (dto.price !== undefined && dto.price < 0) {
      throw new DomainValidationException('Price must be non-negative');
    }

    if (dto.discount !== undefined && dto.discount < 0) {
      throw new DomainValidationException('Discount must be non-negative');
    }

    if (dto.categoryId) {
      const category = await this.storeItemCategoryRepository.findById(
        dto.categoryId,
      );
      if (!category) {
        throw new DomainNotFoundException('Store item category not found');
      }
    }
  }
}
