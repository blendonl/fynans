import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  ExpenseResponse,
  IncomeResponse,
  TransactionStatisticsResponse,
  ExpenseStatisticsResponse,
  ExpenseTrendResponse,
  PaginatedResponse,
} from "@fynans/shared";
import { DASHBOARD_RECENT_LIMIT } from "@/lib/pagination";
import { formatDateForAPI, getChartGranularity } from "@/lib/date-utils";
import { mapExpenseToTransaction, mapIncomeToTransaction, sortTransactionsByDate } from "@/lib/transaction-mappers";

export type { ExpenseTrendResponse as ExpenseTrendPoint } from "@fynans/shared";

export interface ComparisonData {
  expenses: { delta: number; percentage: number };
  income: { delta: number; percentage: number };
  net: { delta: number; percentage: number };
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
      apiClient.get<TransactionStatisticsResponse>("/transactions/statistics", dateParams),
  });

  const prevStatsQuery = useQuery({
    queryKey: ["dashboard-transaction-stats", prevFromStr, prevToStr],
    queryFn: () =>
      apiClient.get<TransactionStatisticsResponse>("/transactions/statistics", {
        dateFrom: prevFromStr,
        dateTo: prevToStr,
      }),
  });

  const expenseStatsQuery = useQuery({
    queryKey: ["dashboard-expense-stats", dateFromStr, dateToStr],
    queryFn: () =>
      apiClient.get<ExpenseStatisticsResponse>("/expenses/statistics", dateParams),
  });

  const prevExpenseStatsQuery = useQuery({
    queryKey: ["dashboard-expense-stats", prevFromStr, prevToStr],
    queryFn: () =>
      apiClient.get<ExpenseStatisticsResponse>("/expenses/statistics", {
        dateFrom: prevFromStr,
        dateTo: prevToStr,
      }),
  });

  const trendsQuery = useQuery({
    queryKey: ["dashboard-expense-trends", dateFromStr, dateToStr, granularity],
    queryFn: () =>
      apiClient.get<ExpenseTrendResponse[]>("/expenses/trends", {
        ...dateParams,
        groupBy: granularity,
      }),
  });

  const recentQuery = useQuery({
    queryKey: ["dashboard-recent", dateFromStr, dateToStr],
    queryFn: async () => {
      const limit = String(DASHBOARD_RECENT_LIMIT);
      const [expensesRes, incomesRes] = await Promise.all([
        apiClient.get<PaginatedResponse<ExpenseResponse>>("/expenses", { limit, ...dateParams }),
        apiClient.get<PaginatedResponse<IncomeResponse>>("/incomes", { limit, ...dateParams }),
      ]);

      const expenses = (expensesRes.data || []).map((e) => mapExpenseToTransaction(e));
      const incomes = (incomesRes.data || []).map((i) => mapIncomeToTransaction(i));

      return sortTransactionsByDate([...expenses, ...incomes])
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
