export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function getCurrencyIcon(): string {
  return "currency-usd";
}

export function formatQuantity(quantity: number): string {
  if (quantity % 1 === 0) return quantity.toString();
  return quantity.toFixed(3).replace(/\.?0+$/, "");
}
