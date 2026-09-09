import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';

export type MoneyInput = Decimal | number | string;

export interface ExpenseLineItem {
  price: MoneyInput;
  discount?: MoneyInput | null;
  quantity?: MoneyInput | null;
}

function toDecimal(value: MoneyInput | null | undefined, fallback: string): Decimal {
  if (value === null || value === undefined) {
    return new Decimal(fallback);
  }
  return value instanceof Decimal ? value : new Decimal(value.toString());
}

export class ExpenseTotalCalculator {
  static lineTotal(item: ExpenseLineItem): Decimal {
    const price = toDecimal(item.price, '0');
    const discount = toDecimal(item.discount, '0');
    const quantity = toDecimal(item.quantity, '1');

    return price.minus(discount).times(quantity);
  }

  static total(items: readonly ExpenseLineItem[]): Decimal {
    return items.reduce(
      (sum, item) => sum.plus(ExpenseTotalCalculator.lineTotal(item)),
      new Decimal(0),
    );
  }
}
