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

/** Runtime expense responses include `receiptImages` not yet in the spec. */
interface ExpenseWithExtras extends ExpenseResponse {
  receiptImages?: string[];
}

export function mapExpenseToTransaction(expense: ExpenseResponse, family?: Family): Transaction {
  const tx = expense.transaction as TransactionWithExtras | undefined;
  const exp = expense as ExpenseWithExtras;
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
    receiptImages: exp.receiptImages || [],
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
