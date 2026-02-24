import { Injectable } from '@nestjs/common';
import { CreateExpenseUseCase } from '../use-cases/create-expense.use-case';
import { GetExpenseByIdUseCase } from '../use-cases/get-expense-by-id.use-case';
import { ListExpensesUseCase } from '../use-cases/list-expenses.use-case';
import { UpdateExpenseUseCase } from '../use-cases/update-expense.use-case';
import { DeleteExpenseUseCase } from '../use-cases/delete-expense.use-case';
import { GetExpenseStatisticsUseCase } from '../use-cases/get-expense-statistics.use-case';
import { GetExpenseTrendsUseCase } from '../use-cases/get-expense-trends.use-case';
import { AddItemToExpenseUseCase } from '../use-cases/add-item-to-expense.use-case';
import { ApprovePendingExpenseUseCase } from '../use-cases/approve-pending-expense.use-case';
import { RejectPendingExpenseUseCase } from '../use-cases/reject-pending-expense.use-case';
import { ResubmitRejectedExpenseUseCase } from '../use-cases/resubmit-rejected-expense.use-case';
import { UpdatePendingExpenseUseCase } from '../use-cases/update-pending-expense.use-case';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { UpdateExpenseDto } from '../dto/update-expense.dto';
import { UpdatePendingExpenseDto } from '../dto/update-pending-expense.dto';
import { ResubmitExpenseDto } from '../dto/resubmit-expense.dto';
import { ExpenseFilters } from '../dto/expense-filters.dto';
import { ExpenseStatistics } from '../dto/expense-statistics.dto';
import { ExpenseTrendPoint } from '../dto/expense-trends.dto';
import { Expense } from '../../domain/entities/expense.entity';
import { PaginatedResult } from '../../domain/repositories/expense.repository.interface';
import { CreateExpenseItemDto } from '~feature/expense-item/core';
import { Pagination } from '~feature/transaction/core';

@Injectable()
export class ExpenseService {
  constructor(
    private readonly createExpenseUseCase: CreateExpenseUseCase,
    private readonly getExpenseByIdUseCase: GetExpenseByIdUseCase,
    private readonly listExpensesUseCase: ListExpensesUseCase,
    private readonly updateExpenseUseCase: UpdateExpenseUseCase,
    private readonly deleteExpenseUseCase: DeleteExpenseUseCase,
    private readonly getExpenseStatisticsUseCase: GetExpenseStatisticsUseCase,
    private readonly getExpenseTrendsUseCase: GetExpenseTrendsUseCase,
    private readonly addItemToExpenseUseCase: AddItemToExpenseUseCase,
    private readonly approvePendingExpenseUseCase: ApprovePendingExpenseUseCase,
    private readonly rejectPendingExpenseUseCase: RejectPendingExpenseUseCase,
    private readonly resubmitRejectedExpenseUseCase: ResubmitRejectedExpenseUseCase,
    private readonly updatePendingExpenseUseCase: UpdatePendingExpenseUseCase,
  ) {}

  async create(dto: CreateExpenseDto): Promise<Expense> {
    return this.createExpenseUseCase.execute(dto);
  }

  async findById(id: string, userId: string): Promise<Expense> {
    return this.getExpenseByIdUseCase.execute(id, userId);
  }

  async findAll(
    userId: string,
    filters?: ExpenseFilters,
    pagination?: Pagination,
  ): Promise<PaginatedResult<Expense>> {
    return this.listExpensesUseCase.execute(userId, filters, pagination);
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateExpenseDto,
  ): Promise<Expense> {
    return this.updateExpenseUseCase.execute(id, userId, dto);
  }

  async delete(id: string, userId: string): Promise<void> {
    return this.deleteExpenseUseCase.execute(id, userId);
  }

  async getStatistics(
    userId: string,
    filters?: ExpenseFilters,
  ): Promise<ExpenseStatistics> {
    return this.getExpenseStatisticsUseCase.execute(userId, filters);
  }

  async getTrends(
    userId: string,
    dateFrom: Date,
    dateTo: Date,
    groupBy: string,
    filters?: ExpenseFilters,
    maxLabels?: number,
  ): Promise<ExpenseTrendPoint[]> {
    return this.getExpenseTrendsUseCase.execute(
      userId,
      dateFrom,
      dateTo,
      groupBy,
      filters,
      maxLabels,
    );
  }

  async addItem(
    expenseId: string,
    itemDto: CreateExpenseItemDto,
    storeId: string,
    userId: string,
  ): Promise<Expense> {
    return this.addItemToExpenseUseCase.execute(expenseId, itemDto, storeId, userId);
  }

  async approvePending(expenseId: string, userId: string): Promise<Expense> {
    return this.approvePendingExpenseUseCase.execute(expenseId, userId);
  }

  async rejectPending(
    expenseId: string,
    userId: string,
    rejectionReason: string,
  ): Promise<Expense> {
    return this.rejectPendingExpenseUseCase.execute(expenseId, userId, rejectionReason);
  }

  async resubmitRejected(
    expenseId: string,
    userId: string,
    dto?: ResubmitExpenseDto,
  ): Promise<Expense> {
    return this.resubmitRejectedExpenseUseCase.execute(expenseId, userId, dto);
  }

  async updatePending(
    expenseId: string,
    userId: string,
    dto: UpdatePendingExpenseDto,
  ): Promise<Expense> {
    return this.updatePendingExpenseUseCase.execute(expenseId, userId, dto);
  }
}
