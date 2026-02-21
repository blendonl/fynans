import { useQuery } from "@tanstack/react-query";
import type {
  TransactionStatisticsResponse,
  ExpenseTrendResponse,
} from "@/types";
import { transactionControllerGetStatistics } from "@/api/generated/endpoints/transaction/transaction";
import { expenseControllerGetStatistics, expenseControllerGetTrends } from "@/api/generated/endpoints/expense/expense";
import { expenseControllerFindAll } from "@/api/generated/endpoints/expense/expense";
import { incomeControllerFindAll } from "@/api/generated/endpoints/income/income";
import { formatDateForAPI, getChartGranularity } from "@/lib/date-utils";
import { mapExpenseToTransaction, mapIncomeToTransaction, sortTransactionsByDate } from "@/lib/transaction-mappers";

const DASHBOARD_RECENT_LIMIT = 5;

export type { ExpenseTrendResponse as ExpenseTrendPoint } from "@/types";

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
    queryFn: async () => {
      const res = await transactionControllerGetStatistics(dateParams);
      return res.data;
    },
  });

  const prevStatsQuery = useQuery({
    queryKey: ["dashboard-transaction-stats", prevFromStr, prevToStr],
    queryFn: async () => {
      const res = await transactionControllerGetStatistics({
        dateFrom: prevFromStr,
        dateTo: prevToStr,
      });
      return res.data;
    },
  });

  const expenseStatsQuery = useQuery({
    queryKey: ["dashboard-expense-stats", dateFromStr, dateToStr],
    queryFn: async () => {
      const res = await expenseControllerGetStatistics(dateParams);
      return res.data;
    },
  });

  const prevExpenseStatsQuery = useQuery({
    queryKey: ["dashboard-expense-stats", prevFromStr, prevToStr],
    queryFn: async () => {
      const res = await expenseControllerGetStatistics({
        dateFrom: prevFromStr,
        dateTo: prevToStr,
      });
      return res.data;
    },
  });

  const trendsQuery = useQuery({
    queryKey: ["dashboard-expense-trends", dateFromStr, dateToStr, granularity],
    queryFn: async () => {
      const res = await expenseControllerGetTrends({
        ...dateParams,
        groupBy: granularity,
      });
      return res.data;
    },
  });

  const recentQuery = useQuery({
    queryKey: ["dashboard-recent", dateFromStr, dateToStr],
    queryFn: async () => {
      const limit = DASHBOARD_RECENT_LIMIT;
      const [expensesRes, incomesRes] = await Promise.all([
        expenseControllerFindAll({ limit, ...dateParams }).then((r) => r.data),
        incomeControllerFindAll({ limit, ...dateParams }).then((r) => r.data),
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
