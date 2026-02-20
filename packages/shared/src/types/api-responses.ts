/**
 * Shared API response types matching the backend DTOs.
 * These types ensure type safety at the API boundary between backend and frontend.
 */

// --- Pagination ---

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// --- Transaction ---

export interface TransactionResponse {
  id: string;
  userId: string;
  type: 'EXPENSE' | 'INCOME';
  value: number;
  scope?: 'PERSONAL' | 'FAMILY';
  familyId?: string;
  recordedAt: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    image?: string | null;
  };
}

export interface TransactionStatisticsResponse {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  count: number;
}

// --- Expense Category ---

export interface ExpenseCategoryResponse {
  id: string;
  parentId: string | null;
  name: string;
  isConnectedToStore: boolean;
  createdAt: string;
  updatedAt: string;
}

// --- Income Category ---

export interface IncomeCategoryResponse {
  id: string;
  parentId: string | null;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// --- Store ---

export interface StoreResponse {
  id: string;
  name: string;
  location: string;
  createdAt: string;
  updatedAt: string;
}

// --- Expense Item ---

export interface ExpenseItemResponse {
  id: string;
  itemId: string;
  name: string;
  expenseId: string;
  categoryId: string;
  price: number;
  discount: number;
  finalPrice: number;
  discountPercentage: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

// --- Expense ---

export interface ExpenseResponse {
  id: string;
  transactionId: string;
  categoryId: string;
  storeId: string | null;
  name: string;
  transaction: TransactionResponse;
  category: ExpenseCategoryResponse;
  store: StoreResponse | null;
  items: ExpenseItemResponse[];
  matchedItems?: ExpenseItemResponse[];
  receiptImages?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseStatisticsResponse {
  totalExpenses: number;
  expenseCount: number;
  averageExpense: number;
  expensesByCategory: {
    categoryId: string;
    categoryName: string;
    total: number;
  }[];
  expensesByStore: {
    storeName: string;
    total: number;
    count: number;
  }[];
}

export interface ExpenseTrendResponse {
  date: string;
  total: number;
  count: number;
  showLabel?: boolean;
}

// --- Income ---

export interface IncomeResponse {
  id: string;
  transactionId: string;
  storeId: string;
  categoryId: string;
  transaction?: TransactionResponse;
  category?: IncomeCategoryResponse;
  createdAt: string;
  updatedAt: string;
}
