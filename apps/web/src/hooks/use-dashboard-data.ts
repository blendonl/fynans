import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { transactionControllerGetStatisticsComparison } from "@/api/generated/endpoints/transaction/transaction";
import { expenseControllerGetStatistics, expenseControllerGetTrends } from "@/api/generated/endpoints/expense/expense";
import { expenseControllerFindAll } from "@/api/generated/endpoints/expense/expense";
import { incomeControllerFindAll } from "@/api/generated/endpoints/income/income";
import { formatDateForAPI, getChartGranularity, calculatePreviousPeriod } from "@/lib/date-utils";
import { mapExpenseToTransaction, mapIncomeToTransaction, sortTransactionsByDate } from "@/lib/transaction-mappers";
import { queryKeys } from "@/lib/query-keys";
const DASHBOARD_RECENT_LIMIT = 5;
const DASHBOARD_STALE_TIME = 60_000;

export type { ExpenseTrendResponse as ExpenseTrendPoint } from "@/types";

interface DashboardDataParams {
  dateFrom: Date;
  dateTo: Date;
  paymentMethodId?: string;
  scope?: string;
}

export function useDashboardData({
  dateFrom,
  dateTo,
  paymentMethodId,
  scope,
}: DashboardDataParams) {
  const dateFromStr = useMemo(() => formatDateForAPI(dateFrom), [dateFrom]);
  const dateToStr = useMemo(() => formatDateForAPI(dateTo), [dateTo]);
  const granularity = useMemo(() => getChartGranularity(dateFrom, dateTo), [dateFrom, dateTo]);

  const previousPeriod = useMemo(() => calculatePreviousPeriod(dateFrom, dateTo), [dateFrom, dateTo]);
  const prevFromStr = useMemo(() => formatDateForAPI(previousPeriod.dateFrom), [previousPeriod]);
  const prevToStr = useMemo(() => formatDateForAPI(previousPeriod.dateTo), [previousPeriod]);

  const extraParams = useMemo(() => {
    const p: Record<string, string> = {};
    if (paymentMethodId) p.paymentMethodId = paymentMethodId;
    if (scope) p.scope = scope.toUpperCase();
    return p;
  }, [paymentMethodId, scope]);

  const dateParams = useMemo(() => ({ dateFrom: dateFromStr, dateTo: dateToStr, ...extraParams }), [dateFromStr, dateToStr, extraParams]);
  const filterKey = useMemo(() => `${paymentMethodId || ""}-${scope || ""}`, [paymentMethodId, scope]);

  const comparisonQuery = useQuery({
    queryKey: [...queryKeys.dashboard.comparison(dateFromStr, dateToStr), filterKey],
    queryFn: async () => {
      const res = await transactionControllerGetStatisticsComparison(dateParams);
      return res.data;
    },
    staleTime: DASHBOARD_STALE_TIME,
  });

  const expenseStatsQuery = useQuery({
    queryKey: [...queryKeys.dashboard.expenseStats(dateFromStr, dateToStr), filterKey],
    queryFn: async () => {
      const res = await expenseControllerGetStatistics(dateParams);
      return res.data;
    },
    staleTime: DASHBOARD_STALE_TIME,
  });

  const prevExpenseStatsQuery = useQuery({
    queryKey: [...queryKeys.dashboard.expenseStats(prevFromStr, prevToStr), filterKey],
    queryFn: async () => {
      const res = await expenseControllerGetStatistics({
        dateFrom: prevFromStr,
        dateTo: prevToStr,
        ...extraParams,
      });
      return res.data;
    },
    staleTime: DASHBOARD_STALE_TIME,
  });

  const trendsQuery = useQuery({
    queryKey: [...queryKeys.dashboard.trends(dateFromStr, dateToStr, granularity), filterKey],
    queryFn: async () => {
      const res = await expenseControllerGetTrends({
        ...dateParams,
        groupBy: granularity,
      });
      return res.data;
    },
    staleTime: DASHBOARD_STALE_TIME,
  });

  const recentQuery = useQuery({
    queryKey: [...queryKeys.dashboard.recent(dateFromStr, dateToStr), filterKey],
    queryFn: async () => {
      const limit = DASHBOARD_RECENT_LIMIT;
      const [expensesRes, incomesRes] = await Promise.all([
        expenseControllerFindAll({ limit, ...dateParams }).then((r: { data: { data: unknown[] } }) => r.data),
        incomeControllerFindAll({ limit, ...dateParams }).then((r: { data: { data: unknown[] } }) => r.data),
      ]);

      const expenses = (expensesRes.data || []).map((e: unknown) => mapExpenseToTransaction(e as Parameters<typeof mapExpenseToTransaction>[0]));
      const incomes = (incomesRes.data || []).map((i: unknown) => mapIncomeToTransaction(i as Parameters<typeof mapIncomeToTransaction>[0]));

      return sortTransactionsByDate([...expenses, ...incomes])
        .slice(0, DASHBOARD_RECENT_LIMIT);
    },
    staleTime: DASHBOARD_STALE_TIME,
  });

  const currentStats = comparisonQuery.data?.current;
  const comparison = comparisonQuery.data?.comparison ?? null;
  const expenseStats = expenseStatsQuery.data;

  return {
    stats: {
      totalExpenses: currentStats?.totalExpense ?? 0,
      totalIncome: currentStats?.totalIncome ?? 0,
      net: currentStats?.balance ?? 0,
      count: currentStats?.count ?? 0,
    },
    comparison,
    recentTransactions: recentQuery.data ?? [],
    expensesByCategory: expenseStats?.expensesByCategory ?? [],
    previousExpensesByCategory: prevExpenseStatsQuery.data?.expensesByCategory ?? [],
    expensesByStore: expenseStats?.expensesByStore ?? [],
    trendData: trendsQuery.data ?? [],
    isLoading:
      comparisonQuery.isLoading ||
      recentQuery.isLoading ||
      trendsQuery.isLoading,
  };
}
