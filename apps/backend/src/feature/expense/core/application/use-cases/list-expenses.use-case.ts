import { Injectable, Inject } from '@nestjs/common';
import {
  type IExpenseRepository,
  PaginatedResult,
} from '../../domain/repositories/expense.repository.interface';
import { Expense } from '../../domain/entities/expense.entity';
import { ExpenseFilters } from '../dto/expense-filters.dto';
import { Pagination } from '../../../../transaction/core/application/dto/pagination.dto';
import { VerifyFamilyMembershipUseCase } from '../../../../family/core/application/use-cases/verify-family-membership.use-case';

@Injectable()
export class ListExpensesUseCase {
  constructor(
    @Inject('ExpenseRepository')
    private readonly expenseRepository: IExpenseRepository,
    private readonly verifyFamilyMembershipUseCase: VerifyFamilyMembershipUseCase,
  ) {}

  async execute(
    userId: string,
    filters?: ExpenseFilters,
    pagination?: Pagination,
  ): Promise<PaginatedResult<Expense>> {
    if (filters?.familyId) {
      await this.verifyFamilyMembershipUseCase.execute(
        filters.familyId,
        userId,
      );
    }

    return this.expenseRepository.findAll(filters, pagination);
  }
}
