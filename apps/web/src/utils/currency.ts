const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

export function formatQuantity(quantity: number): string {
  if (quantity % 1 === 0) return quantity.toString();
  return quantity.toFixed(3).replace(/\.?0+$/, "");
}
