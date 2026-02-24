import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import type {
  Transaction,
  TransactionFilters,
  Family,
  ExpenseResponse,
  IncomeResponse,
} from "@/types";
import { expenseControllerFindAll } from "@/api/generated/endpoints/expense/expense";
import { incomeControllerFindAll } from "@/api/generated/endpoints/income/income";
import { mapExpenseToTransaction, mapIncomeToTransaction, sortTransactionsByDate } from "@/lib/transaction-mappers";
import { DEFAULT_PAGE_SIZE } from "@/lib/query-keys";

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
      const baseParams: Record<string, string | number | undefined> = {
        page: pageParam,
        limit: DEFAULT_PAGE_SIZE,
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
          ? expenseControllerFindAll(baseParams as Record<string, string>).then((r) => r.data)
          : Promise.resolve({ data: [] as ExpenseResponse[], total: 0, page: pageParam, limit: DEFAULT_PAGE_SIZE }),
        fetchIncomes
          ? incomeControllerFindAll(baseParams as Record<string, string>).then((r) => r.data)
          : Promise.resolve({ data: [] as IncomeResponse[], total: 0, page: pageParam, limit: DEFAULT_PAGE_SIZE }),
      ]);

      const family = filters.familyId ? families.find((f) => f.id === filters.familyId) : undefined;

      const expenses = (expensesRes.data || []).map((e) => mapExpenseToTransaction(e, family));
      const incomes = (incomesRes.data || []).map((i) => mapIncomeToTransaction(i, family));

      const merged = sortTransactionsByDate([...expenses, ...incomes]);

      const expenseHasMore = fetchExpenses && pageParam * DEFAULT_PAGE_SIZE < (expensesRes.total ?? 0);
      const incomeHasMore = fetchIncomes && pageParam * DEFAULT_PAGE_SIZE < (incomesRes.total ?? 0);

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
    queryKey: ["transactions", filters?.type, filters?.scope, filters?.familyId, families.length, limit],
    queryFn: async () => {
      const params: Record<string, string | number | undefined> = {};
      if (filters?.familyId) params.familyId = filters.familyId;
      if (filters?.scope && filters.scope !== "all") params.scope = filters.scope.toUpperCase();
      if (limit) params.limit = limit;

      const [expensesRes, incomesRes] = await Promise.all([
        expenseControllerFindAll(params as Record<string, string>).then((r) => r.data),
        incomeControllerFindAll(params as Record<string, string>).then((r) => r.data),
      ]);

      const family = filters?.familyId ? families.find((f) => f.id === filters.familyId) : undefined;

      const expenses = (expensesRes.data || []).map((e) => mapExpenseToTransaction(e, family));
      const incomes = (incomesRes.data || []).map((i) => mapIncomeToTransaction(i, family));

      return sortTransactionsByDate([...expenses, ...incomes]);
    },
  });
}

// Re-export groupByMonth for backward compatibility
export { groupByMonth, type MonthGroup } from "@/lib/transaction-mappers";

