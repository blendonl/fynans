import { Injectable, Inject } from '@nestjs/common';
import {
  type IExpenseRepository,
  PaginatedResult,
} from '../../domain/repositories/expense.repository.interface';
import { Expense } from '../../domain/entities/expense.entity';
import { ExpenseFilters } from '../dto/expense-filters.dto';
import { Pagination } from '~common/dto/pagination.dto';
import { FamilyService } from '../../../../family/core/application/services/family.service';

@Injectable()
export class ListExpensesUseCase {
  constructor(
    @Inject('ExpenseRepository')
    private readonly expenseRepository: IExpenseRepository,
    private readonly familyService: FamilyService,
  ) {}

  async execute(
    userId: string,
    filters?: ExpenseFilters,
    pagination?: Pagination,
  ): Promise<PaginatedResult<Expense>> {
    if (filters?.familyId) {
      await this.familyService.verifyMembership(
        filters.familyId,
        userId,
      );
    }

    return this.expenseRepository.findAll(filters, pagination);
  }
}
