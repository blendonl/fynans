import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Transaction } from "@fynans/shared";
import { DASHBOARD_RECENT_LIMIT } from "@/lib/pagination";

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
  expensesByCategory: { categoryName: string; total: number; count: number }[];
  expensesByStore: { storeName: string; total: number; count: number }[];
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
      createdAt: tx?.createdAt as string | undefined,
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
      createdAt: (tx?.createdAt as string) || (income.createdAt as string),
      description: tx?.description as string | undefined,
      user: tx?.user as { id: string; firstName: string; lastName: string },
    },
    receiptImages: (income.receiptImages as string[]) || [],
  };
}

export function useDashboardData() {
  const statsQuery = useQuery({
    queryKey: ["dashboard-transaction-stats"],
    queryFn: () => apiClient.get("/transactions/statistics") as Promise<TransactionStatistics>,
  });

  const expenseStatsQuery = useQuery({
    queryKey: ["dashboard-expense-stats"],
    queryFn: () => apiClient.get("/expenses/statistics") as Promise<ExpenseStatistics>,
  });

  const recentQuery = useQuery({
    queryKey: ["dashboard-recent"],
    queryFn: async () => {
      const limit = String(DASHBOARD_RECENT_LIMIT);
      const [expensesRes, incomesRes] = await Promise.all([
        apiClient.get("/expenses", { limit }) as Promise<{ data: Record<string, unknown>[] }>,
        apiClient.get("/incomes", { limit }) as Promise<{ data: Record<string, unknown>[] }>,
      ]);

      const expenses = (expensesRes.data || []).map(mapExpenseToTransaction);
      const incomes = (incomesRes.data || []).map(mapIncomeToTransaction);

      return [...expenses, ...incomes]
        .sort((a, b) => {
          const dateA = a.transaction.createdAt ? new Date(a.transaction.createdAt).getTime() : 0;
          const dateB = b.transaction.createdAt ? new Date(b.transaction.createdAt).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, DASHBOARD_RECENT_LIMIT);
    },
  });

  const txStats = statsQuery.data;
  const expenseStats = expenseStatsQuery.data;

  return {
    stats: {
      totalExpenses: txStats?.totalExpense ?? 0,
      totalIncome: txStats?.totalIncome ?? 0,
      net: txStats?.balance ?? 0,
      count: txStats?.count ?? 0,
    },
    recentTransactions: recentQuery.data ?? [],
    expensesByCategory: expenseStats?.expensesByCategory ?? [],
    expensesByStore: expenseStats?.expensesByStore ?? [],
    isLoading: statsQuery.isLoading || recentQuery.isLoading,
  };
}
