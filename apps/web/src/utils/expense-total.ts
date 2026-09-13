export interface ExpenseLineItem {
  price: number | null;
  discount?: number | null;
  quantity: number;
}

export function expenseLineTotal(item: ExpenseLineItem): number {
  return ((item.price ?? 0) - (item.discount ?? 0)) * item.quantity;
}

export function expenseLinesTotal(items: ExpenseLineItem[]): number {
  return items.reduce((sum, item) => sum + expenseLineTotal(item), 0);
}
