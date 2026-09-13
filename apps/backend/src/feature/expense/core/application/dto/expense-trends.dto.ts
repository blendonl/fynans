import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';

export class ExpenseTrendPoint {
  date: string;
  total: Decimal;
  count: number;
  showLabel: boolean;

  constructor(date: string, total: Decimal, count: number, showLabel = false) {
    this.date = date;
    this.total = total;
    this.count = count;
    this.showLabel = showLabel;
  }
}
