export function calculateExpenseItemTotal(item: {
  price: number;
  discount: number;
  quantity: number;
}): number {
  return (item.price - item.discount) * item.quantity;
}

export function calculateExpenseItemsTotal(
  items: Array<{ price: number; discount: number; quantity: number }>,
): number {
  return items.reduce((sum, item) => sum + calculateExpenseItemTotal(item), 0);
}

export function calculateBasketItemTotal(item: {
  price: number | null;
  quantity: number;
}): number {
  return (item.price ?? 0) * item.quantity;
}

export function calculateBasketItemsTotal(
  items: Array<{ price: number | null; quantity: number }>,
): number {
  return items.reduce((sum, item) => sum + calculateBasketItemTotal(item), 0);
}
