import { Injectable, Inject } from '@nestjs/common';
import { type IExpenseRepository } from '../../domain/repositories/expense.repository.interface';
import { ExpenseFilters } from '../dto/expense-filters.dto';
import { ExpenseTrendPoint } from '../dto/expense-trends.dto';
import { selectLabelIndices } from '../utils/select-label-indices';
import { FamilyService } from '../../../../family/core/application/services/family.service';

@Injectable()
export class GetExpenseTrendsUseCase {
  constructor(
    @Inject('ExpenseRepository')
    private readonly expenseRepository: IExpenseRepository,
    private readonly familyService: FamilyService,
  ) {}

  async execute(
    userId: string,
    dateFrom: Date,
    dateTo: Date,
    groupBy: string,
    filters?: ExpenseFilters,
    maxLabels = 7,
  ): Promise<ExpenseTrendPoint[]> {
    if (filters?.familyId) {
      await this.familyService.verifyMembership(filters.familyId, userId);
    }

    const points = await this.expenseRepository.getTrends(
      dateFrom,
      dateTo,
      groupBy,
      filters,
    );

    const labelIndices = selectLabelIndices(points.length, maxLabels);
    for (let i = 0; i < points.length; i++) {
      points[i].showLabel = labelIndices.has(i);
    }

    return points;
  }
}
