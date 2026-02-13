export class ExpenseStatistics {
  totalExpenses: number;
  expenseCount: number;
  averageExpense: number;
  expensesByCategory: { categoryId: string; categoryName: string; total: number }[];
  expensesByStore: { storeId: string; total: number }[];

  constructor(
    totalExpenses: number,
    expenseCount: number,
    averageExpense: number,
    expensesByCategory: { categoryId: string; categoryName: string; total: number }[],
    expensesByStore: { storeId: string; total: number }[],
  ) {
    this.totalExpenses = totalExpenses;
    this.expenseCount = expenseCount;
    this.averageExpense = averageExpense;
    this.expensesByCategory = expensesByCategory;
    this.expensesByStore = expensesByStore;
  }
}
