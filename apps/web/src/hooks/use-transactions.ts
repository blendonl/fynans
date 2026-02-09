import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Transaction, TransactionFilters, Family } from "@mmoneymanager/shared";

function mapExpenseToTransaction(expense: Record<string, unknown>, family?: Family): Transaction {
  const tx = expense.transaction as Record<string, unknown> | undefined;
  return {
    id: expense.id as string,
    type: "expense",
    category: expense.category as { id: string; name: string },
    store: expense.store as { id: string; name: string; location?: string } | undefined,
    scope: (tx?.scope as "PERSONAL" | "FAMILY") || "PERSONAL",
    familyId: tx?.familyId as string | undefined,
    family: family ? { id: family.id, name: family.name } : undefined,
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

function mapIncomeToTransaction(income: Record<string, unknown>, family?: Family): Transaction {
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
    family: family ? { id: family.id, name: family.name } : undefined,
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

export function useTransactions(filters?: TransactionFilters, families: Family[] = []) {
  return useQuery({
    queryKey: ["transactions", filters?.scope, filters?.familyId, families.length],
    queryFn: async () => {
      const params: Record<string, string | undefined> = {};
      if (filters?.familyId) params.familyId = filters.familyId;
      if (filters?.scope && filters.scope !== "all") params.scope = filters.scope.toUpperCase();

      const [expensesRes, incomesRes] = await Promise.all([
        apiClient.get("/expenses", params) as Promise<{ data: Record<string, unknown>[] }>,
        apiClient.get("/incomes", params) as Promise<{ data: Record<string, unknown>[] }>,
      ]);

      const family = filters?.familyId ? families.find((f) => f.id === filters.familyId) : undefined;

      const expenses = (expensesRes.data || []).map((e) => mapExpenseToTransaction(e, family));
      const incomes = (incomesRes.data || []).map((i) => mapIncomeToTransaction(i, family));

      return [...expenses, ...incomes].sort((a, b) => {
        const dateA = a.transaction.createdAt ? new Date(a.transaction.createdAt).getTime() : 0;
        const dateB = b.transaction.createdAt ? new Date(b.transaction.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    },
  });
}

export function groupByMonth(transactions: Transaction[]) {
  const groups: Record<string, Transaction[]> = {};

  transactions.forEach((transaction) => {
    if (transaction.transaction.createdAt) {
      const date = new Date(transaction.transaction.createdAt);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;

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
    const total = items.reduce((sum, item) => sum + item.transaction.value, 0);
    return { key, monthLabel, total, transactions: items };
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
