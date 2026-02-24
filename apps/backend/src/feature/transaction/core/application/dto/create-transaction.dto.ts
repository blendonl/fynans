import { TransactionType } from '../../domain/value-objects/transaction-type.vo';
import { TransactionStatus } from '../../domain/value-objects/transaction-status.vo';

export class CreateTransactionDto {
  userId: string;
  type: TransactionType;
  value: number;
  familyId?: string;
  recordedAt?: Date;
  paymentMethodId?: string;
  status?: TransactionStatus;

  constructor(
    userId: string,
    type: TransactionType,
    value: number,
    recordedAt?: Date,
    familyId?: string,
    paymentMethodId?: string,
    status?: TransactionStatus,
  ) {
    this.userId = userId;
    this.type = type;
    this.value = value;
    this.recordedAt = recordedAt;
    this.familyId = familyId;
    this.paymentMethodId = paymentMethodId;
    this.status = status;
  }
}
