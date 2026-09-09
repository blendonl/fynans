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

export interface ExpenseStatistics {
  totalExpenses: Decimal;
  expenseCount: number;
  averageExpense: Decimal;
  expensesByCategory: ExpenseCategoryTotal[];
  expensesByStore: ExpenseStoreTotal[];
}
