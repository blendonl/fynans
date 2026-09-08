import { Injectable, Inject } from '@nestjs/common';
import { type IExpenseRepository } from '../../domain/repositories/expense.repository.interface';
import { ExpenseFilters } from '../dto/expense-filters.dto';
import { ExpenseStatistics } from '../dto/expense-statistics.dto';
import { FamilyService } from '../../../../family/core/application/services/family.service';

@Injectable()
export class GetExpenseStatisticsUseCase {
  constructor(
    @Inject('ExpenseRepository')
    private readonly expenseRepository: IExpenseRepository,
    private readonly familyService: FamilyService,
  ) {}

  async execute(
    userId: string,
    filters?: ExpenseFilters,
  ): Promise<ExpenseStatistics> {
    if (filters?.familyId) {
      await this.familyService.verifyMembership(filters.familyId, userId);
    }

    const stats = await this.expenseRepository.getStatistics(filters);

    return new ExpenseStatistics(
      stats.totalExpenses,
      stats.expenseCount,
      stats.averageExpense,
      stats.expensesByCategory,
      stats.expensesByStore,
    );
  }
}
