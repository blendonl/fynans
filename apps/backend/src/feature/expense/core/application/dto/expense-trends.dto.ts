export class ExpenseTrendPoint {
  date: string;
  total: number;
  count: number;
  showLabel: boolean;

  constructor(date: string, total: number, count: number, showLabel = false) {
    this.date = date;
    this.total = total;
    this.count = count;
    this.showLabel = showLabel;
  }
}
