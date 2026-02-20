import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  Transaction,
  ExpenseResponse,
  IncomeResponse,
  TransactionStatisticsResponse,
  ExpenseStatisticsResponse,
  ExpenseTrendResponse,
  PaginatedResponse,
} from "@fynans/shared";
import { DASHBOARD_RECENT_LIMIT } from "@/lib/pagination";
import { formatDateForAPI, getChartGranularity } from "@/lib/date-utils";

export type { ExpenseTrendResponse as ExpenseTrendPoint } from "@fynans/shared";

export interface ComparisonData {
  expenses: { delta: number; percentage: number };
  income: { delta: number; percentage: number };
  net: { delta: number; percentage: number };
}

function mapExpenseToTransaction(expense: ExpenseResponse): Transaction {
  const tx = expense.transaction;
  return {
    id: expense.id,
    type: "expense",
    category: { id: expense.category.id, name: expense.category.name },
    store: expense.store ? { id: expense.store.id, name: expense.store.name, location: expense.store.location } : undefined,
    scope: (tx?.scope as "PERSONAL" | "FAMILY") || "PERSONAL",
    familyId: tx?.familyId,
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
    receiptImages: expense.receiptImages || [],
  };
}

function mapIncomeToTransaction(income: IncomeResponse): Transaction {
  const tx = income.transaction;
  return {
    id: income.id,
    type: "income",
    category: income.category
      ? { id: income.category.id, name: income.category.name }
      : { id: income.categoryId, name: "Income" },
    scope: (tx?.scope as "PERSONAL" | "FAMILY") || "PERSONAL",
    familyId: tx?.familyId,
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

function calcComparison(
  current: TransactionStatisticsResponse | undefined,
  previous: TransactionStatisticsResponse | undefined,
): ComparisonData | null {
  if (!current || !previous) return null;

  function delta(cur: number, prev: number) {
    const d = cur - prev;
    const pct = prev !== 0 ? (d / prev) * 100 : cur !== 0 ? 100 : 0;
    return { delta: d, percentage: Math.round(pct) };
  }

  return {
    expenses: delta(current.totalExpense, previous.totalExpense),
    income: delta(current.totalIncome, previous.totalIncome),
    net: delta(current.balance, previous.balance),
  };
}

interface DashboardDataParams {
  dateFrom: Date;
  dateTo: Date;
  previousDateFrom: Date;
  previousDateTo: Date;
}

export function useDashboardData({
  dateFrom,
  dateTo,
  previousDateFrom,
  previousDateTo,
}: DashboardDataParams) {
  const dateFromStr = formatDateForAPI(dateFrom);
  const dateToStr = formatDateForAPI(dateTo);
  const prevFromStr = formatDateForAPI(previousDateFrom);
  const prevToStr = formatDateForAPI(previousDateTo);
  const granularity = getChartGranularity(dateFrom, dateTo);

  const dateParams = { dateFrom: dateFromStr, dateTo: dateToStr };

  const statsQuery = useQuery({
    queryKey: ["dashboard-transaction-stats", dateFromStr, dateToStr],
    queryFn: () =>
      apiClient.get("/transactions/statistics", dateParams) as Promise<TransactionStatisticsResponse>,
  });

  const prevStatsQuery = useQuery({
    queryKey: ["dashboard-transaction-stats", prevFromStr, prevToStr],
    queryFn: () =>
      apiClient.get("/transactions/statistics", {
        dateFrom: prevFromStr,
        dateTo: prevToStr,
      }) as Promise<TransactionStatisticsResponse>,
  });

  const expenseStatsQuery = useQuery({
    queryKey: ["dashboard-expense-stats", dateFromStr, dateToStr],
    queryFn: () =>
      apiClient.get("/expenses/statistics", dateParams) as Promise<ExpenseStatisticsResponse>,
  });

  const prevExpenseStatsQuery = useQuery({
    queryKey: ["dashboard-expense-stats", prevFromStr, prevToStr],
    queryFn: () =>
      apiClient.get("/expenses/statistics", {
        dateFrom: prevFromStr,
        dateTo: prevToStr,
      }) as Promise<ExpenseStatisticsResponse>,
  });

  const trendsQuery = useQuery({
    queryKey: ["dashboard-expense-trends", dateFromStr, dateToStr, granularity],
    queryFn: () =>
      apiClient.get("/expenses/trends", {
        ...dateParams,
        groupBy: granularity,
      }) as Promise<ExpenseTrendResponse[]>,
  });

  const recentQuery = useQuery({
    queryKey: ["dashboard-recent", dateFromStr, dateToStr],
    queryFn: async () => {
      const limit = String(DASHBOARD_RECENT_LIMIT);
      const [expensesRes, incomesRes] = await Promise.all([
        apiClient.get("/expenses", { limit, ...dateParams }) as Promise<PaginatedResponse<ExpenseResponse>>,
        apiClient.get("/incomes", { limit, ...dateParams }) as Promise<PaginatedResponse<IncomeResponse>>,
      ]);

      const expenses = (expensesRes.data || []).map(mapExpenseToTransaction);
      const incomes = (incomesRes.data || []).map(mapIncomeToTransaction);

      return [...expenses, ...incomes]
        .sort((a, b) => {
          const dateA = a.transaction.recordedAt
            ? new Date(a.transaction.recordedAt).getTime()
            : 0;
          const dateB = b.transaction.recordedAt
            ? new Date(b.transaction.recordedAt).getTime()
            : 0;
          return dateB - dateA;
        })
        .slice(0, DASHBOARD_RECENT_LIMIT);
    },
  });

  const txStats = statsQuery.data;
  const expenseStats = expenseStatsQuery.data;
  const comparison = calcComparison(statsQuery.data, prevStatsQuery.data);

  return {
    stats: {
      totalExpenses: txStats?.totalExpense ?? 0,
      totalIncome: txStats?.totalIncome ?? 0,
      net: txStats?.balance ?? 0,
      count: txStats?.count ?? 0,
    },
    comparison,
    recentTransactions: recentQuery.data ?? [],
    expensesByCategory: expenseStats?.expensesByCategory ?? [],
    previousExpensesByCategory: prevExpenseStatsQuery.data?.expensesByCategory ?? [],
    expensesByStore: expenseStats?.expensesByStore ?? [],
    trendData: trendsQuery.data ?? [],
    isLoading:
      statsQuery.isLoading ||
      prevStatsQuery.isLoading ||
      recentQuery.isLoading ||
      trendsQuery.isLoading,
  };
}
