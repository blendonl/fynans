import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';
import { TransactionAmountNormalizer } from './transaction-amount.normalizer';
import { TransactionType } from '../value-objects/transaction-type.vo';

describe('TransactionAmountNormalizer', () => {
  it('normalizes to the raw value while every transaction shares one currency', () => {
    const value = new Decimal('12.34');

    expect(TransactionAmountNormalizer.normalize({ value })).toBe(value);
  });

  it('credits income and debits expense', () => {
    expect(
      TransactionAmountNormalizer.signedDelta({
        value: new Decimal('40'),
        type: TransactionType.INCOME,
      }).toString(),
    ).toBe('40');

    expect(
      TransactionAmountNormalizer.signedDelta({
        value: new Decimal('40'),
        type: TransactionType.EXPENSE,
      }).toString(),
    ).toBe('-40');
  });

  it('signs aggregated totals the same way as single transactions', () => {
    const single = TransactionAmountNormalizer.signedDelta({
      value: new Decimal('7.5'),
      type: TransactionType.EXPENSE,
    });
    const total = TransactionAmountNormalizer.signedTotal(
      TransactionType.EXPENSE,
      new Decimal('7.5'),
    );

    expect(total.toString()).toBe(single.toString());
  });

  it('treats a missing aggregate as zero', () => {
    expect(TransactionAmountNormalizer.normalizeSum(null).toString()).toBe('0');
    expect(TransactionAmountNormalizer.normalizeSum(undefined).toString()).toBe(
      '0',
    );
    expect(
      TransactionAmountNormalizer.normalizeSum(new Decimal('3')).toString(),
    ).toBe('3');
  });

  it('names the single aggregate field that balances are summed over', () => {
    expect(TransactionAmountNormalizer.sumField).toBe('value');
  });
});
