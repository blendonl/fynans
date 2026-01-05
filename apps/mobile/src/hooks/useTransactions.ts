import { useState, useEffect, useCallback } from "react";
import { apiClient } from "../api/client";
import { Transaction, TransactionFilters } from "../features/transactions/types";

export const useTransactions = (filters?: TransactionFilters) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransactions = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Build query parameters from filters
      const params: any = {};
      if (filters?.familyId) {
        params.familyId = filters.familyId;
      }
      if (filters?.scope && filters.scope !== 'all') {
        params.scope = filters.scope.toUpperCase();
      }

      const [expensesResponse, incomesResponse] = await Promise.all([
        apiClient.get("/expenses", params),
        apiClient.get("/incomes", params),
      ]);

      const expenses: Transaction[] = (expensesResponse.data || []).map(
        (expense: any) => ({
          id: expense.id,
          type: "expense" as const,
          category: expense.category,
          store: expense.store,
          scope: expense.transaction?.scope || "PERSONAL",
          transaction: {
            ...expense.transaction,
            description: expense.transaction?.description,
            user: expense.transaction?.user,
          },
          items: expense.items,
          receiptImages: expense.receiptImages || [],
        }),
      );

      const incomes: Transaction[] = (incomesResponse.data || []).map(
        (income: any) => ({
          id: income.id,
          type: "income" as const,
          category: income.category || { id: income.categoryId, name: "Income" },
          scope: income.transaction?.scope || "PERSONAL",
          transaction: {
            id: income.transactionId,
            value: income.transaction?.value || 0,
            createdAt: income.transaction?.createdAt || income.createdAt,
            description: income.transaction?.description,
            user: income.transaction?.user,
          },
          receiptImages: income.receiptImages || [],
        }),
      );

      const allTransactions = [...expenses, ...incomes].sort((a, b) => {
        const dateA = a.transaction.createdAt
          ? new Date(a.transaction.createdAt).getTime()
          : 0;
        const dateB = b.transaction.createdAt
          ? new Date(b.transaction.createdAt).getTime()
          : 0;
        return dateB - dateA;
      });

      setTransactions(allTransactions);
    } catch (err: any) {
      setError(err.message || "Failed to fetch transactions");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refresh = useCallback(() => {
    fetchTransactions(true);
  }, [filters]);

  useEffect(() => {
    fetchTransactions();
  }, [filters?.familyId, filters?.scope]);

  const groupByMonth = (transactions: Transaction[]) => {
    const groups: { [key: string]: Transaction[] } = {};

    transactions.forEach((transaction) => {
      if (transaction.transaction.createdAt) {
        const date = new Date(transaction.transaction.createdAt);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        const monthLabel = date.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });

        if (!groups[monthKey]) {
          groups[monthKey] = [];
        }
        groups[monthKey].push(transaction);
      }
    });

    return Object.entries(groups).map(([key, items]) => {
      const date = new Date(items[0].transaction.createdAt!);
      const monthLabel = date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
      const total = items.reduce(
        (sum, item) => sum + item.transaction.value,
        0,
      );

      return {
        key,
        monthLabel,
        total,
        transactions: items,
      };
    });
  };

  const getStats = (transactions: Transaction[]) => {
    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.transaction.value, 0);

    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.transaction.value, 0);

    const count = transactions.length;
    const average =
      count > 0
        ? transactions.reduce((sum, t) => sum + t.transaction.value, 0) / count
        : 0;

    return {
      totalExpenses,
      totalIncome,
      net: totalIncome - totalExpenses,
      count,
      average,
    };
  };

  return {
    transactions,
    loading,
    error,
    refreshing,
    refresh,
    groupByMonth,
    getStats,
    retry: () => fetchTransactions(),
  };
};
