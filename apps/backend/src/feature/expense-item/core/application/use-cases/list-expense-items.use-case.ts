import { Injectable, Inject } from '@nestjs/common';
import {
  type IExpenseItemRepository,
  PaginatedResult,
} from '../../domain/repositories/expense-item.repository.interface';
import { ExpenseItem } from '../../domain/entities/expense-item.entity';
import { Pagination } from '~common/dto/pagination.dto';

@Injectable()
export class ListExpenseItemsUseCase {
  constructor(
    @Inject('ExpenseItemRepository')
    private readonly expenseItemRepository: IExpenseItemRepository,
  ) {}

  async execute(
    expenseId?: string,
    pagination?: Pagination,
  ): Promise<PaginatedResult<ExpenseItem>> {
    if (expenseId) {
      const items = await this.expenseItemRepository.findByExpenseId(expenseId);
      return {
        data: items,
        total: items.length,
      };
    }

    return this.expenseItemRepository.findAll(pagination);
  }
}
