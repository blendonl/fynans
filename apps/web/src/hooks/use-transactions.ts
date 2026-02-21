import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  Transaction,
  TransactionFilters,
  Family,
  ExpenseResponse,
  IncomeResponse,
} from "@/types";
import { PAGE_SIZE, type PaginatedResponse } from "@/lib/pagination";

function mapExpenseToTransaction(expense: ExpenseResponse, family?: Family): Transaction {
  const tx = expense.transaction;
  return {
    id: expense.id,
    type: "expense",
    category: { id: expense.category.id, name: expense.category.name },
    store: expense.store ? { id: expense.store.id, name: expense.store.name, location: expense.store.location } : undefined,
    scope: (tx?.scope as "PERSONAL" | "FAMILY") || "PERSONAL",
    familyId: tx?.familyId,
    family: family ? { id: family.id, name: family.name } : undefined,
    transaction: {
      id: tx?.id || "",
      value: tx?.value || 0,
      recordedAt: tx?.recordedAt,
      description: tx?.description,
      user: tx?.user || { id: "", firstName: "", lastName: "" },
    },
    items: expense.items?.map((item) => ({
      name: item.name,
      price: item.price,
      discount: item.discount,
      quantity: item.quantity,
    })),
    matchedItems: expense.matchedItems?.length
      ? expense.matchedItems.map((item) => ({
          name: item.name,
          price: item.price,
          discount: item.discount,
          quantity: item.quantity,
        }))
      : undefined,
    receiptImages: expense.receiptImages || [],
  };
}

function mapIncomeToTransaction(income: IncomeResponse, family?: Family): Transaction {
  const tx = income.transaction;
  return {
    id: income.id,
    type: "income",
    category: income.category
      ? { id: income.category.id, name: income.category.name }
      : { id: income.categoryId, name: "Income" },
    scope: (tx?.scope as "PERSONAL" | "FAMILY") || "PERSONAL",
    familyId: tx?.familyId,
    family: family ? { id: family.id, name: family.name } : undefined,
    transaction: {
      id: income.transactionId || "",
      value: tx?.value || 0,
      recordedAt: tx?.recordedAt || income.createdAt,
      description: tx?.description,
      user: tx?.user || { id: "", firstName: "", lastName: "" },
    },
    receiptImages: [],
  };
}

interface ServerFilters {
  type?: string;
  scope?: string;
  familyId?: string | null;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: string;
  maxAmount?: string;
  search?: string;
}

interface InfiniteTransactionPage {
  transactions: Transaction[];
  expenseTotal: number;
  incomeTotal: number;
  hasMore: boolean;
}

export function useInfiniteTransactions(filters: ServerFilters = {}, families: Family[] = []) {
  return useInfiniteQuery({
    queryKey: [
      "transactions-infinite",
      filters.type,
      filters.scope,
      filters.familyId,
      filters.dateFrom,
      filters.dateTo,
      filters.minAmount,
      filters.maxAmount,
      filters.search,
    ],
    queryFn: async ({ pageParam = 1 }): Promise<InfiniteTransactionPage> => {
      const baseParams: Record<string, string | undefined> = {
        page: String(pageParam),
        limit: String(PAGE_SIZE),
      };
      if (filters.familyId) baseParams.familyId = filters.familyId;
      if (filters.scope && filters.scope !== "all") baseParams.scope = filters.scope.toUpperCase();
      if (filters.dateFrom) baseParams.dateFrom = filters.dateFrom;
      if (filters.dateTo) baseParams.dateTo = filters.dateTo;
      if (filters.minAmount) baseParams.valueMin = filters.minAmount;
      if (filters.maxAmount) baseParams.valueMax = filters.maxAmount;
      if (filters.search) baseParams.search = filters.search;

      const fetchExpenses = filters.type !== "income";
      const fetchIncomes = filters.type !== "expense";

      const [expensesRes, incomesRes] = await Promise.all([
        fetchExpenses
          ? (apiClient.get("/expenses", baseParams) as Promise<PaginatedResponse<ExpenseResponse>>)
          : Promise.resolve({ data: [] as ExpenseResponse[], total: 0, page: pageParam, limit: PAGE_SIZE }),
        fetchIncomes
          ? (apiClient.get("/incomes", baseParams) as Promise<PaginatedResponse<IncomeResponse>>)
          : Promise.resolve({ data: [] as IncomeResponse[], total: 0, page: pageParam, limit: PAGE_SIZE }),
      ]);

      const family = filters.familyId ? families.find((f) => f.id === filters.familyId) : undefined;

      const expenses = (expensesRes.data || []).map((e) => mapExpenseToTransaction(e, family));
      const incomes = (incomesRes.data || []).map((i) => mapIncomeToTransaction(i, family));

      const merged = [...expenses, ...incomes].sort((a, b) => {
        const dateA = a.transaction.recordedAt ? new Date(a.transaction.recordedAt).getTime() : 0;
        const dateB = b.transaction.recordedAt ? new Date(b.transaction.recordedAt).getTime() : 0;
        return dateB - dateA;
      });

      const expenseHasMore = fetchExpenses && pageParam * PAGE_SIZE < (expensesRes.total ?? 0);
      const incomeHasMore = fetchIncomes && pageParam * PAGE_SIZE < (incomesRes.total ?? 0);

      return {
        transactions: merged,
        expenseTotal: expensesRes.total ?? 0,
        incomeTotal: incomesRes.total ?? 0,
        hasMore: expenseHasMore || incomeHasMore,
      };
    },
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      return lastPage.hasMore ? (lastPageParam as number) + 1 : undefined;
    },
    initialPageParam: 1,
  });
}

export function useTransactions(filters?: TransactionFilters, families: Family[] = [], limit?: number) {
  return useQuery({
    queryKey: ["transactions", filters?.scope, filters?.familyId, families.length, limit],
    queryFn: async () => {
      const params: Record<string, string | undefined> = {};
      if (filters?.familyId) params.familyId = filters.familyId;
      if (filters?.scope && filters.scope !== "all") params.scope = filters.scope.toUpperCase();
      if (limit) params.limit = String(limit);

      const [expensesRes, incomesRes] = await Promise.all([
        apiClient.get("/expenses", params) as Promise<PaginatedResponse<ExpenseResponse>>,
        apiClient.get("/incomes", params) as Promise<PaginatedResponse<IncomeResponse>>,
      ]);

      const family = filters?.familyId ? families.find((f) => f.id === filters.familyId) : undefined;

      const expenses = (expensesRes.data || []).map((e) => mapExpenseToTransaction(e, family));
      const incomes = (incomesRes.data || []).map((i) => mapIncomeToTransaction(i, family));

      return [...expenses, ...incomes].sort((a, b) => {
        const dateA = a.transaction.recordedAt ? new Date(a.transaction.recordedAt).getTime() : 0;
        const dateB = b.transaction.recordedAt ? new Date(b.transaction.recordedAt).getTime() : 0;
        return dateB - dateA;
      });
    },
  });
}

export interface MonthGroup {
  key: string;
  monthLabel: string;
  total: number;
  income: number;
  expenses: number;
  matchedItemsTotal: number;
  transactions: Transaction[];
}

export function groupByMonth(transactions: Transaction[]): MonthGroup[] {
  const groups: Record<string, Transaction[]> = {};

  transactions.forEach((transaction) => {
    if (transaction.transaction.recordedAt) {
      const date = new Date(transaction.transaction.recordedAt);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;

      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(transaction);
    }
  });

  return Object.entries(groups).map(([key, items]) => {
    const date = new Date(items[0].transaction.recordedAt!);
    const monthLabel = date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    const income = items
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.transaction.value, 0);
    const expenses = items
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.transaction.value, 0);
    const matchedItemsTotal = items.reduce((sum, t) => {
      if (!t.matchedItems?.length) return sum;
      return sum + t.matchedItems.reduce(
        (itemSum, item) => itemSum + (item.price - (item.discount || 0)) * item.quantity,
        0,
      );
    }, 0);
    const total = income - expenses;
    return { key, monthLabel, total, income, expenses, matchedItemsTotal, transactions: items };
  });
}

export function getStats(transactions: Transaction[]) {
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.transaction.value, 0);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.transaction.value, 0);

  return {
    totalExpenses,
    totalIncome,
    net: totalIncome - totalExpenses,
    count: transactions.length,
  };
}
