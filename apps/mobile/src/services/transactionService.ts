import { apiClient } from '../api/client';
import { Transaction } from '../features/transactions/types';

const mapExpenseToTransaction = (expense: any): Transaction => ({
  id: expense.id,
  type: 'expense' as const,
  category: expense.category,
  store: expense.store,
  scope: expense.transaction?.scope || 'PERSONAL',
  familyId: expense.transaction?.familyId,
  family: expense.transaction?.family,
  transaction: {
    ...expense.transaction,
    description: expense.transaction?.description,
    user: expense.transaction?.user,
  },
  items: expense.items,
  receiptImages: expense.receiptImages || [],
});

const mapIncomeToTransaction = (income: any): Transaction => ({
  id: income.id,
  type: 'income' as const,
  category: income.category || { id: income.categoryId, name: 'Income' },
  scope: income.transaction?.scope || 'PERSONAL',
  familyId: income.transaction?.familyId,
  family: income.transaction?.family,
  transaction: {
    id: income.transactionId,
    value: income.transaction?.value || 0,
    createdAt: income.transaction?.createdAt || income.createdAt,
    description: income.transaction?.description,
    user: income.transaction?.user,
  },
  receiptImages: income.receiptImages || [],
});

export const transactionService = {
  async fetchExpenseById(expenseId: string): Promise<Transaction> {
    const expense = await apiClient.get(`/expenses/${expenseId}`);
    return mapExpenseToTransaction(expense);
  },

  async fetchIncomeById(incomeId: string): Promise<Transaction> {
    const income = await apiClient.get(`/incomes/${incomeId}`);
    return mapIncomeToTransaction(income);
  },

  async fetchIncomeByTransactionId(transactionId: string): Promise<Transaction> {
    const income = await apiClient.get(`/incomes/transaction/${transactionId}`);
    return mapIncomeToTransaction(income);
  },
};
