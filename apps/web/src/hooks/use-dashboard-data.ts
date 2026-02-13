import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Transaction } from "@fynans/shared";
import { DASHBOARD_RECENT_LIMIT } from "@/lib/pagination";
import { formatDateForAPI, getChartGranularity } from "@/lib/date-utils";

interface TransactionStatistics {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  count: number;
}

interface ExpenseStatistics {
  totalExpenses: number;
  expenseCount: number;
  averageExpense: number;
  expensesByCategory: { categoryId: string; categoryName: string; total: number }[];
  expensesByStore: { storeName: string; total: number; count: number }[];
}

export interface ExpenseTrendPoint {
  date: string;
  total: number;
  count: number;
  showLabel?: boolean;
}

export interface ComparisonData {
  expenses: { delta: number; percentage: number };
  income: { delta: number; percentage: number };
  net: { delta: number; percentage: number };
}

function mapExpenseToTransaction(expense: Record<string, unknown>): Transaction {
  const tx = expense.transaction as Record<string, unknown> | undefined;
  return {
    id: expense.id as string,
    type: "expense",
    category: expense.category as { id: string; name: string },
    store: expense.store as { id: string; name: string; location?: string } | undefined,
    scope: (tx?.scope as "PERSONAL" | "FAMILY") || "PERSONAL",
    familyId: tx?.familyId as string | undefined,
    transaction: {
      id: (tx?.id as string) || "",
      value: (tx?.value as number) || 0,
      recordedAt: tx?.recordedAt as string | undefined,
      description: tx?.description as string | undefined,
      user: tx?.user as { id: string; firstName: string; lastName: string },
    },
    items: expense.items as Transaction["items"],
    receiptImages: (expense.receiptImages as string[]) || [],
  };
}

function mapIncomeToTransaction(income: Record<string, unknown>): Transaction {
  const tx = income.transaction as Record<string, unknown> | undefined;
  return {
    id: income.id as string,
    type: "income",
    category: (income.category as { id: string; name: string }) || {
      id: income.categoryId as string,
      name: "Income",
    },
    scope: (tx?.scope as "PERSONAL" | "FAMILY") || "PERSONAL",
    familyId: tx?.familyId as string | undefined,
    transaction: {
      id: (income.transactionId as string) || "",
      value: (tx?.value as number) || 0,
      recordedAt: (tx?.recordedAt as string) || (income.createdAt as string),
      description: tx?.description as string | undefined,
      user: tx?.user as { id: string; firstName: string; lastName: string },
    },
    receiptImages: (income.receiptImages as string[]) || [],
  };
}

function calcComparison(
  current: TransactionStatistics | undefined,
  previous: TransactionStatistics | undefined,
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
      apiClient.get("/transactions/statistics", dateParams) as Promise<TransactionStatistics>,
  });

  const prevStatsQuery = useQuery({
    queryKey: ["dashboard-transaction-stats", prevFromStr, prevToStr],
    queryFn: () =>
      apiClient.get("/transactions/statistics", {
        dateFrom: prevFromStr,
        dateTo: prevToStr,
      }) as Promise<TransactionStatistics>,
  });

  const expenseStatsQuery = useQuery({
    queryKey: ["dashboard-expense-stats", dateFromStr, dateToStr],
    queryFn: () =>
      apiClient.get("/expenses/statistics", dateParams) as Promise<ExpenseStatistics>,
  });

  const prevExpenseStatsQuery = useQuery({
    queryKey: ["dashboard-expense-stats", prevFromStr, prevToStr],
    queryFn: () =>
      apiClient.get("/expenses/statistics", {
        dateFrom: prevFromStr,
        dateTo: prevToStr,
      }) as Promise<ExpenseStatistics>,
  });

  const trendsQuery = useQuery({
    queryKey: ["dashboard-expense-trends", dateFromStr, dateToStr, granularity],
    queryFn: () =>
      apiClient.get("/expenses/trends", {
        ...dateParams,
        groupBy: granularity,
      }) as Promise<ExpenseTrendPoint[]>,
  });

  const recentQuery = useQuery({
    queryKey: ["dashboard-recent", dateFromStr, dateToStr],
    queryFn: async () => {
      const limit = String(DASHBOARD_RECENT_LIMIT);
      const [expensesRes, incomesRes] = await Promise.all([
        apiClient.get("/expenses", { limit, ...dateParams }) as Promise<{
          data: Record<string, unknown>[];
        }>,
        apiClient.get("/incomes", { limit, ...dateParams }) as Promise<{
          data: Record<string, unknown>[];
        }>,
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
