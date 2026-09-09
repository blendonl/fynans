import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';
import { ExpenseTotalCalculator } from './expense-total.calculator';

describe('ExpenseTotalCalculator', () => {
  describe('lineTotal', () => {
    it('applies the discount per unit, not per line', () => {
      const total = ExpenseTotalCalculator.lineTotal({
        price: 10,
        discount: 2,
        quantity: 3,
      });

      expect(total.toString()).toBe('24');
    });

    it('defaults quantity to 1 and discount to 0', () => {
      expect(ExpenseTotalCalculator.lineTotal({ price: 7.5 }).toString()).toBe(
        '7.5',
      );
    });

    it('treats null discount and quantity as their defaults', () => {
      const total = ExpenseTotalCalculator.lineTotal({
        price: '4.25',
        discount: null,
        quantity: null,
      });

      expect(total.toString()).toBe('4.25');
    });

    it('returns zero when the discount equals the price', () => {
      const total = ExpenseTotalCalculator.lineTotal({
        price: 3.33,
        discount: 3.33,
        quantity: 9,
      });

      expect(total.toString()).toBe('0');
    });

    it('accepts Decimal inputs', () => {
      const total = ExpenseTotalCalculator.lineTotal({
        price: new Decimal('1.10'),
        discount: new Decimal('0.10'),
        quantity: new Decimal('3'),
      });

      expect(total.toString()).toBe('3');
    });

    it('is exact where binary floating point is not', () => {
      const total = ExpenseTotalCalculator.lineTotal({
        price: '0.1',
        discount: '0',
        quantity: '3',
      });

      expect(total.toString()).toBe('0.3');
      expect(0.1 * 3).not.toBe(0.3);
    });

    it('keeps fractional quantities exact', () => {
      const total = ExpenseTotalCalculator.lineTotal({
        price: '0.59',
        discount: '0',
        quantity: '3.115',
      });

      expect(total.toString()).toBe('1.83785');
    });
  });

  describe('total', () => {
    it('sums line totals', () => {
      const total = ExpenseTotalCalculator.total([
        { price: 10, discount: 2, quantity: 3 },
        { price: 5, discount: 0, quantity: 2 },
        { price: 1.99 },
      ]);

      expect(total.toString()).toBe('35.99');
    });

    it('returns zero for no items', () => {
      expect(ExpenseTotalCalculator.total([]).toString()).toBe('0');
    });

    it('does not use the price * quantity - discount formula', () => {
      const items = [{ price: 10, discount: 2, quantity: 3 }];

      expect(ExpenseTotalCalculator.total(items).toNumber()).toBe(24);
      expect(ExpenseTotalCalculator.total(items).toNumber()).not.toBe(28);
    });

    it('does not use the price * quantity formula', () => {
      const items = [{ price: 10, discount: 2, quantity: 3 }];

      expect(ExpenseTotalCalculator.total(items).toNumber()).not.toBe(30);
    });
  });
});
