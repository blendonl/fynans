import { useState, useEffect, useCallback } from "react";
import { apiClient } from "../api/client";
import { Transaction, TransactionFilters } from "../features/transactions/types";
import { websocketService } from "../services/websocketService";

interface Family {
  id: string;
  name: string;
}

export const useTransactions = (filters?: TransactionFilters, families: Family[] = []) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const mapExpenseToTransaction = (expense: any, family?: Family): Transaction => ({
    id: expense.id,
    type: "expense" as const,
    category: expense.category,
    store: expense.store,
    scope: expense.transaction?.scope || "PERSONAL",
    familyId: expense.transaction?.familyId,
    family: family ? { id: family.id, name: family.name } : undefined,
    transaction: {
      ...expense.transaction,
      description: expense.transaction?.description,
      user: expense.transaction?.user,
    },
    items: expense.items,
    receiptImages: expense.receiptImages || [],
  });

  const mapIncomeToTransaction = (income: any, family?: Family): Transaction => ({
    id: income.id,
    type: "income" as const,
    category: income.category || { id: income.categoryId, name: "Income" },
    scope: income.transaction?.scope || "PERSONAL",
    familyId: income.transaction?.familyId,
    family: family ? { id: family.id, name: family.name } : undefined,
    transaction: {
      id: income.transactionId,
      value: income.transaction?.value || 0,
      createdAt: income.transaction?.createdAt || income.createdAt,
      description: income.transaction?.description,
      user: income.transaction?.user,
    },
    receiptImages: income.receiptImages || [],
  });

  const fetchTransactions = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const shouldFetchAll = !filters?.scope || filters.scope === 'all';

      if (shouldFetchAll && families.length > 0) {
        const [personalExpenses, personalIncomes] = await Promise.all([
          apiClient.get("/expenses", {}),
          apiClient.get("/incomes", {}),
        ]);

        const familyRequests = families.flatMap((family) => [
          apiClient.get("/expenses", { familyId: family.id }).then((res) => ({
            type: 'expense' as const,
            data: res.data || [],
            family,
          })),
          apiClient.get("/incomes", { familyId: family.id }).then((res) => ({
            type: 'income' as const,
            data: res.data || [],
            family,
          })),
        ]);

        const familyResults = await Promise.all(familyRequests);

        const personalExpenseTransactions = (personalExpenses.data || []).map(
          (e: any) => mapExpenseToTransaction(e)
        );
        const personalIncomeTransactions = (personalIncomes.data || []).map(
          (i: any) => mapIncomeToTransaction(i)
        );

        const familyTransactions: Transaction[] = [];
        for (const result of familyResults) {
          if (result.type === 'expense') {
            familyTransactions.push(
              ...result.data.map((e: any) => mapExpenseToTransaction(e, result.family))
            );
          } else {
            familyTransactions.push(
              ...result.data.map((i: any) => mapIncomeToTransaction(i, result.family))
            );
          }
        }

        const allTransactionsMap = new Map<string, Transaction>();
        [...personalExpenseTransactions, ...personalIncomeTransactions, ...familyTransactions].forEach((t) => {
          allTransactionsMap.set(t.id, t);
        });

        const allTransactions = Array.from(allTransactionsMap.values()).sort((a, b) => {
          const dateA = a.transaction.createdAt ? new Date(a.transaction.createdAt).getTime() : 0;
          const dateB = b.transaction.createdAt ? new Date(b.transaction.createdAt).getTime() : 0;
          return dateB - dateA;
        });

        setTransactions(allTransactions);
      } else {
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

        const family = filters?.familyId ? families.find((f) => f.id === filters.familyId) : undefined;

        const expenses = (expensesResponse.data || []).map((e: any) => mapExpenseToTransaction(e, family));
        const incomes = (incomesResponse.data || []).map((i: any) => mapIncomeToTransaction(i, family));

        const allTransactions = [...expenses, ...incomes].sort((a, b) => {
          const dateA = a.transaction.createdAt ? new Date(a.transaction.createdAt).getTime() : 0;
          const dateB = b.transaction.createdAt ? new Date(b.transaction.createdAt).getTime() : 0;
          return dateB - dateA;
        });

        setTransactions(allTransactions);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch transactions");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refresh = useCallback(() => {
    fetchTransactions(true);
  }, [filters, families]);

  useEffect(() => {
    fetchTransactions();
  }, [filters?.familyId, filters?.scope, families.length]);

  useEffect(() => {
    const handleTransactionNotification = (notification: any) => {
      if (notification.type === 'FAMILY_TRANSACTION_CREATED') {
        fetchTransactions(true);
      }
    };

    websocketService.on('notification:new', handleTransactionNotification);

    return () => {
      websocketService.off('notification:new', handleTransactionNotification);
    };
  }, [filters]);

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
