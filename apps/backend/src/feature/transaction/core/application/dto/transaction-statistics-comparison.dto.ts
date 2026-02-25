import { TransactionStatistics } from './transaction-statistics.dto';

export class DeltaComparison {
  delta: number;
  percentage: number;

  constructor(delta: number, percentage: number) {
    this.delta = delta;
    this.percentage = percentage;
  }
}

export class StatisticsComparison {
  income: DeltaComparison;
  expense: DeltaComparison;
  net: DeltaComparison;

  constructor(income: DeltaComparison, expense: DeltaComparison, net: DeltaComparison) {
    this.income = income;
    this.expense = expense;
    this.net = net;
  }
}

export class TransactionStatisticsComparison {
  current: TransactionStatistics;
  previous: TransactionStatistics;
  comparison: StatisticsComparison;

  constructor(
    current: TransactionStatistics,
    previous: TransactionStatistics,
    comparison: StatisticsComparison,
  ) {
    this.current = current;
    this.previous = previous;
    this.comparison = comparison;
  }
}
