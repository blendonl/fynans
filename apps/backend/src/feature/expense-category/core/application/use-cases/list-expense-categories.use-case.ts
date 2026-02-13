import { Injectable, Inject } from '@nestjs/common';
import {
  type IExpenseCategoryRepository,
  PaginatedResult,
} from '../../domain/repositories/expense-category.repository.interface';
import { ExpenseCategory } from '../../domain/entities/expense-category.entity';
import { Pagination } from '../../../../transaction/core/application/dto/pagination.dto';

@Injectable()
export class ListExpenseCategoriesUseCase {
  constructor(
    @Inject('ExpenseCategoryRepository')
    private readonly expenseCategoryRepository: IExpenseCategoryRepository,
  ) {}

  async execute(
    userId: string,
    parentId?: string | null,
    pagination?: Pagination,
    filters?: { search?: string },
  ): Promise<PaginatedResult<ExpenseCategory>> {
    if (parentId !== undefined) {
      return this.expenseCategoryRepository.findByParentId(
        userId,
        parentId,
        pagination,
      );
    }

    return this.expenseCategoryRepository.findAll(userId, pagination, filters);
  }
}
