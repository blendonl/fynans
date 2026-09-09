import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';
import { TransactionType } from '../value-objects/transaction-type.vo';

export interface NormalizableAmount {
  value: Decimal;
}

export interface NormalizableTransaction extends NormalizableAmount {
  type: TransactionType;
}

/**
 * Single source of truth for the amount that denormalized balances
 * (`Family.balance`, `FamilyMember.balance`) are expressed in.
 *
 * Those columns carry no currency, so every balance increment and every
 * reconciliation sum must go through here rather than reading `value`
 * directly. Once `Transaction.settledValue` exists, this is the only place
 * that changes.
 */
export class TransactionAmountNormalizer {
  static readonly sumField = 'value' as const;

  static normalize(transaction: NormalizableAmount): Decimal {
    return transaction.value;
  }

  static normalizeSum(sum: Decimal | null | undefined): Decimal {
    return sum ?? new Decimal(0);
  }

  static signedDelta(transaction: NormalizableTransaction): Decimal {
    return TransactionAmountNormalizer.sign(transaction.type).times(
      TransactionAmountNormalizer.normalize(transaction),
    );
  }

  static signedTotal(type: TransactionType, sum: Decimal): Decimal {
    return TransactionAmountNormalizer.sign(type).times(sum);
  }

  private static sign(type: TransactionType): Decimal {
    return type === TransactionType.INCOME ? new Decimal(1) : new Decimal(-1);
  }
}
