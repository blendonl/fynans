import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';
import { TransactionType } from '../../domain/value-objects/transaction-type.vo';

export class UpdateTransactionDto {
  type?: TransactionType;
  value?: Decimal;

  constructor(data: { type?: TransactionType; value?: Decimal }) {
    this.type = data.type;
    this.value = data.value;
  }
}
