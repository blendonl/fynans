import { Injectable } from '@nestjs/common';
import { CreateExpenseCategoryUseCase } from '../use-cases/create-expense-category.use-case';
import { GetExpenseCategoryByIdUseCase } from '../use-cases/get-expense-category-by-id.use-case';
import { ListExpenseCategoriesUseCase } from '../use-cases/list-expense-categories.use-case';
import { GetCategoryTreeUseCase, CategoryTree } from '../use-cases/get-category-tree.use-case';
import { UpdateExpenseCategoryUseCase } from '../use-cases/update-expense-category.use-case';
import { DeleteExpenseCategoryUseCase } from '../use-cases/delete-expense-category.use-case';
import { CreateExpenseCategoryDto } from '../dto/create-expense-category.dto';
import { UpdateExpenseCategoryDto } from '../dto/update-expense-category.dto';
import { ExpenseCategory } from '../../domain/entities/expense-category.entity';
import { PaginatedResult } from '../../domain/repositories/expense-category.repository.interface';
import { Pagination } from '../../../../transaction/core/application/dto/pagination.dto';

@Injectable()
export class ExpenseCategoryService {
  constructor(
    private readonly createExpenseCategoryUseCase: CreateExpenseCategoryUseCase,
    private readonly getExpenseCategoryByIdUseCase: GetExpenseCategoryByIdUseCase,
    private readonly listExpenseCategoriesUseCase: ListExpenseCategoriesUseCase,
    private readonly getCategoryTreeUseCase: GetCategoryTreeUseCase,
    private readonly updateExpenseCategoryUseCase: UpdateExpenseCategoryUseCase,
    private readonly deleteExpenseCategoryUseCase: DeleteExpenseCategoryUseCase,
  ) {}

  async create(
    dto: CreateExpenseCategoryDto,
    userId: string,
  ): Promise<ExpenseCategory> {
    return this.createExpenseCategoryUseCase.execute(dto, userId);
  }

  async findById(id: string): Promise<ExpenseCategory> {
    return this.getExpenseCategoryByIdUseCase.execute(id);
  }

  async findAll(
    userId: string,
    parentId?: string | null,
    pagination?: Pagination,
    filters?: { search?: string },
  ): Promise<PaginatedResult<ExpenseCategory>> {
    return this.listExpenseCategoriesUseCase.execute(userId, parentId, pagination, filters);
  }

  async getTree(userId: string): Promise<CategoryTree[]> {
    return this.getCategoryTreeUseCase.execute(userId);
  }

  async update(
    id: string,
    dto: UpdateExpenseCategoryDto,
  ): Promise<ExpenseCategory> {
    return this.updateExpenseCategoryUseCase.execute(id, dto);
  }

  async delete(id: string): Promise<void> {
    return this.deleteExpenseCategoryUseCase.execute(id);
  }
}
