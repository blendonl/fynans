import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';

export interface ExpenseCategoryTotal {
  categoryId: string;
  categoryName: string;
  total: Decimal;
}

export interface ExpenseStoreTotal {
  storeId: string;
  total: Decimal;
}

export class ExpenseStatistics {
  totalExpenses: Decimal;
  expenseCount: number;
  averageExpense: Decimal;
  expensesByCategory: ExpenseCategoryTotal[];
  expensesByStore: ExpenseStoreTotal[];

  constructor(
    totalExpenses: Decimal,
    expenseCount: number,
    averageExpense: Decimal,
    expensesByCategory: ExpenseCategoryTotal[],
    expensesByStore: ExpenseStoreTotal[],
  ) {
    this.totalExpenses = totalExpenses;
    this.expenseCount = expenseCount;
    this.averageExpense = averageExpense;
    this.expensesByCategory = expensesByCategory;
    this.expensesByStore = expensesByStore;
  }
}
