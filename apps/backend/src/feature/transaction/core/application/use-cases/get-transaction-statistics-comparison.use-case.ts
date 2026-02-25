import { Injectable, Inject } from '@nestjs/common';
import { type ITransactionRepository } from '../../domain/repositories/transaction.repository.interface';
import { TransactionFilters } from '../dto/transaction-filters.dto';
import {
  TransactionStatisticsComparison,
  DeltaComparison,
  StatisticsComparison,
} from '../dto/transaction-statistics-comparison.dto';

@Injectable()
export class GetTransactionStatisticsComparisonUseCase {
  constructor(
    @Inject('TransactionRepository')
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(
    userId?: string,
    filters?: TransactionFilters,
  ): Promise<TransactionStatisticsComparison> {
    const previousFilters = this.buildPreviousFilters(filters);

    const [current, previous] = await Promise.all([
      this.transactionRepository.getStatistics(userId, filters),
      this.transactionRepository.getStatistics(userId, previousFilters),
    ]);

    const comparison = new StatisticsComparison(
      this.computeDelta(current.totalIncome, previous.totalIncome),
      this.computeDelta(current.totalExpense, previous.totalExpense),
      this.computeDelta(current.balance, previous.balance),
    );

    return new TransactionStatisticsComparison(current, previous, comparison);
  }

  private buildPreviousFilters(filters?: TransactionFilters): TransactionFilters {
    if (!filters?.dateFrom || !filters?.dateTo) {
      return new TransactionFilters({ ...filters });
    }

    const days = Math.ceil(
      (filters.dateTo.getTime() - filters.dateFrom.getTime()) / (1000 * 60 * 60 * 24),
    );

    const previousDateTo = new Date(filters.dateFrom);
    previousDateTo.setDate(previousDateTo.getDate() - 1);
    previousDateTo.setHours(23, 59, 59, 999);

    const previousDateFrom = new Date(filters.dateFrom);
    previousDateFrom.setDate(previousDateFrom.getDate() - days);
    previousDateFrom.setHours(0, 0, 0, 0);

    return new TransactionFilters({
      ...filters,
      dateFrom: previousDateFrom,
      dateTo: previousDateTo,
    });
  }

  private computeDelta(current: number, previous: number): DeltaComparison {
    const delta = current - previous;
    const percentage = previous !== 0
      ? Math.round((delta / previous) * 100)
      : current !== 0 ? 100 : 0;
    return new DeltaComparison(delta, percentage);
  }
}
