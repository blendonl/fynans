import { Injectable } from '@nestjs/common';
import { CreateExpenseItemUseCase } from '../use-cases/create-expense-item.use-case';
import { GetExpenseItemByIdUseCase } from '../use-cases/get-expense-item-by-id.use-case';
import { ListExpenseItemsUseCase } from '../use-cases/list-expense-items.use-case';
import { UpdateExpenseItemUseCase } from '../use-cases/update-expense-item.use-case';
import { DeleteExpenseItemUseCase } from '../use-cases/delete-expense-item.use-case';
import { CalculateExpenseTotalUseCase } from '../use-cases/calculate-expense-total.use-case';
import { CreateExpenseItemDto } from '../dto/create-expense-item.dto';
import { UpdateExpenseItemDto } from '../dto/update-expense-item.dto';
import { ExpenseItem } from '../../domain/entities/expense-item.entity';
import { PaginatedResult } from '../../domain/repositories/expense-item.repository.interface';
import { Pagination } from '../../../../transaction/core/application/dto/pagination.dto';

@Injectable()
export class ExpenseItemService {
  constructor(
    private readonly createExpenseItemUseCase: CreateExpenseItemUseCase,
    private readonly getExpenseItemByIdUseCase: GetExpenseItemByIdUseCase,
    private readonly listExpenseItemsUseCase: ListExpenseItemsUseCase,
    private readonly updateExpenseItemUseCase: UpdateExpenseItemUseCase,
    private readonly deleteExpenseItemUseCase: DeleteExpenseItemUseCase,
    private readonly calculateExpenseTotalUseCase: CalculateExpenseTotalUseCase,
  ) {}

  async create(
    dto: CreateExpenseItemDto,
    storeId: string,
    userId: string,
  ): Promise<ExpenseItem> {
    return this.createExpenseItemUseCase.execute(dto, storeId, userId);
  }

  async findById(id: string): Promise<ExpenseItem> {
    return this.getExpenseItemByIdUseCase.execute(id);
  }

  async findAll(
    expenseId?: string,
    pagination?: Pagination,
  ): Promise<PaginatedResult<ExpenseItem>> {
    return this.listExpenseItemsUseCase.execute(expenseId, pagination);
  }

  async update(id: string, dto: UpdateExpenseItemDto): Promise<ExpenseItem> {
    return this.updateExpenseItemUseCase.execute(id, dto);
  }

  async delete(id: string): Promise<void> {
    return this.deleteExpenseItemUseCase.execute(id);
  }

  async calculateTotal(expenseId: string): Promise<number> {
    return this.calculateExpenseTotalUseCase.execute(expenseId);
  }
}
