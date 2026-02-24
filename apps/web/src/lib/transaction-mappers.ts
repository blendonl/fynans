import type {
  Transaction,
  Family,
  ExpenseResponse,
  IncomeResponse,
  TransactionResponse,
} from "@/types";

/**
 * Runtime transaction responses include `familyId` and `description`,
 * but these are not yet in the OpenAPI spec. Extend the generated type
 * so the mapper can access them safely.
 */
interface TransactionWithExtras extends TransactionResponse {
  familyId?: string | null;
  description?: string;
}

export function mapExpenseToTransaction(expense: ExpenseResponse, family?: Family): Transaction {
  const tx = expense.transaction as TransactionWithExtras | undefined;
  return {
    id: expense.id,
    type: "expense",
    category: { id: expense.category.id, name: expense.category.name },
    store: expense.store ? { id: expense.store.id, name: expense.store.name, location: expense.store.location } : undefined,
    scope: (tx?.scope as "PERSONAL" | "FAMILY") || "PERSONAL",
    familyId: tx?.familyId,
    family: family ? { id: family.id, name: family.name } : undefined,
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
    matchedItems: expense.matchedItems?.length
      ? expense.matchedItems.map((item) => ({
          name: item.name,
          price: item.price,
          discount: item.discount,
          quantity: item.quantity,
        }))
      : undefined,
    receiptImages: expense.receiptImages || [],
  };
}

export function mapIncomeToTransaction(income: IncomeResponse, family?: Family): Transaction {
  const tx = income.transaction as TransactionWithExtras | undefined;
  return {
    id: income.id,
    type: "income",
    category: income.category
      ? { id: income.category.id, name: income.category.name }
      : { id: income.categoryId, name: "Income" },
    scope: (tx?.scope as "PERSONAL" | "FAMILY") || "PERSONAL",
    familyId: tx?.familyId,
    family: family ? { id: family.id, name: family.name } : undefined,
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

export function sortTransactionsByDate(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort((a, b) => {
    const dateA = a.transaction.recordedAt ? new Date(a.transaction.recordedAt).getTime() : 0;
    const dateB = b.transaction.recordedAt ? new Date(b.transaction.recordedAt).getTime() : 0;
    return dateB - dateA;
  });
}

export interface MonthGroup {
  key: string;
  monthLabel: string;
  total: number;
  income: number;
  expenses: number;
  matchedItemsTotal: number;
  transactions: Transaction[];
}

export function groupByMonth(transactions: Transaction[]): MonthGroup[] {
  const groups: Record<string, Transaction[]> = {};

  transactions.forEach((transaction) => {
    if (transaction.transaction.recordedAt) {
      const date = new Date(transaction.transaction.recordedAt);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;

      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(transaction);
    }
  });

  return Object.entries(groups).map(([key, items]) => {
    const date = new Date(items[0].transaction.recordedAt!);
    const monthLabel = date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    const income = items
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.transaction.value, 0);
    const expenses = items
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.transaction.value, 0);
    const matchedItemsTotal = items.reduce((sum, t) => {
      if (!t.matchedItems?.length) return sum;
      return sum + t.matchedItems.reduce(
        (itemSum, item) => itemSum + (item.price - (item.discount || 0)) * item.quantity,
        0,
      );
    }, 0);
    const total = income - expenses;
    return { key, monthLabel, total, income, expenses, matchedItemsTotal, transactions: items };
  });
}
