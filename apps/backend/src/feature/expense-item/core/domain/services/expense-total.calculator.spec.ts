import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';
import { ExpenseTotalCalculator } from './expense-total.calculator';
import { ExpenseItem } from '../entities/expense-item.entity';

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

  describe('the discount formula the web app and the backend disagreed on', () => {
    const DIVERGENT_LINE = { price: 10, discount: 2, quantity: 3 };

    it('charges the discount once per unit', () => {
      expect(
        ExpenseTotalCalculator.lineTotal(DIVERGENT_LINE).toString(),
      ).toBe('24');
    });

    it('is not the price * quantity - discount value the backend used to store', () => {
      expect(
        ExpenseTotalCalculator.lineTotal(DIVERGENT_LINE).toNumber(),
      ).not.toBe(28);
    });

    it('is not the undiscounted price * quantity value', () => {
      expect(
        ExpenseTotalCalculator.lineTotal(DIVERGENT_LINE).toNumber(),
      ).not.toBe(30);
    });

    it('agrees with what the expense item entity reports for the same line', () => {
      const item = new ExpenseItem({
        id: 'item-1',
        itemId: 'catalog-1',
        itemName: 'Coffee',
        expenseId: 'expense-1',
        categoryId: 'category-1',
        price: new Decimal('10'),
        discount: new Decimal('2'),
        quantity: new Decimal('3'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(item.getFinalPrice().toString()).toBe(
        ExpenseTotalCalculator.lineTotal(DIVERGENT_LINE).toString(),
      );
    });
  });

  describe('discount edge cases', () => {
    it('leaves the line at price * quantity when the discount is zero', () => {
      expect(
        ExpenseTotalCalculator.lineTotal({
          price: '12.99',
          discount: 0,
          quantity: 4,
        }).toString(),
      ).toBe('51.96');
    });

    it('treats an explicit zero discount and an omitted one identically', () => {
      const withZero = ExpenseTotalCalculator.lineTotal({
        price: '3.70',
        discount: '0',
        quantity: '2',
      });
      const withoutDiscount = ExpenseTotalCalculator.lineTotal({
        price: '3.70',
        quantity: '2',
      });

      expect(withZero.toString()).toBe(withoutDiscount.toString());
    });

    it('zeroes the whole line when the discount equals the price', () => {
      expect(
        ExpenseTotalCalculator.lineTotal({
          price: '19.99',
          discount: '19.99',
          quantity: '250',
        }).toString(),
      ).toBe('0');
    });

    it('zeroes a free line inside a larger basket instead of dropping it', () => {
      expect(
        ExpenseTotalCalculator.total([
          { price: '5', discount: '5', quantity: '2' },
          { price: '5', discount: '0', quantity: '2' },
        ]).toString(),
      ).toBe('10');
    });

    it('does not clamp a discount above the price, which the entity rejects instead', () => {
      expect(
        ExpenseTotalCalculator.lineTotal({
          price: '5',
          discount: '8',
          quantity: '2',
        }).toString(),
      ).toBe('-6');
    });
  });

  describe('rounding', () => {
    it('does not round a line total to cents', () => {
      expect(
        ExpenseTotalCalculator.lineTotal({
          price: '0.335',
          discount: '0',
          quantity: '3',
        }).toString(),
      ).toBe('1.005');
    });

    it('does not round a per-unit discount away before multiplying', () => {
      expect(
        ExpenseTotalCalculator.lineTotal({
          price: '1.005',
          discount: '0.005',
          quantity: '1000',
        }).toString(),
      ).toBe('1000');
    });

    it('keeps sub-cent lines instead of collapsing them to zero', () => {
      expect(
        ExpenseTotalCalculator.total(
          Array.from({ length: 200 }, () => ({ price: '0.005' })),
        ).toString(),
      ).toBe('1');
    });

    it('sums many two-decimal lines without floating point drift', () => {
      const lines = Array.from({ length: 100 }, () => ({ price: '0.07' }));
      const floatSum = lines.reduce((sum) => sum + 0.07, 0);

      expect(ExpenseTotalCalculator.total(lines).toString()).toBe('7');
      expect(floatSum).not.toBe(7);
    });

    it('rounds only where a caller asks for it', () => {
      const total = ExpenseTotalCalculator.total([
        { price: '0.59', quantity: '3.115' },
      ]);

      expect(total.toString()).toBe('1.83785');
      expect(total.toDecimalPlaces(2).toString()).toBe('1.84');
    });
  });

  describe('fractional quantities', () => {
    it('prices a weighed item to the gram', () => {
      expect(
        ExpenseTotalCalculator.lineTotal({
          price: '4.50',
          discount: '0.50',
          quantity: '0.327',
        }).toString(),
      ).toBe('1.308');
    });

    it('prices a fractional quantity of a fully discounted item at zero', () => {
      expect(
        ExpenseTotalCalculator.lineTotal({
          price: '4.50',
          discount: '4.50',
          quantity: '0.327',
        }).toString(),
      ).toBe('0');
    });

    it('mixes fractional and whole quantities in one basket', () => {
      expect(
        ExpenseTotalCalculator.total([
          { price: '4.50', discount: '0.50', quantity: '0.327' },
          { price: '10', discount: '2', quantity: '3' },
          { price: '1.99' },
        ]).toString(),
      ).toBe('27.298');
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
