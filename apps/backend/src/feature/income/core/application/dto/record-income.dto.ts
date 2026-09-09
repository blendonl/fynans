import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';
import { TransactionStatus } from '../../../../transaction/core/domain/value-objects/transaction-status.vo';

export class RecordIncomeDto {
  userId: string;
  categoryId: string;
  amount: Decimal;
  note?: string;
  familyId?: string;
  recordedAt?: Date;
  paymentMethodId?: string;
  status?: TransactionStatus;

  constructor(data: {
    userId: string;
    categoryId: string;
    amount: Decimal;
    note?: string;
    familyId?: string;
    recordedAt?: Date;
    paymentMethodId?: string;
    status?: TransactionStatus;
  }) {
    this.userId = data.userId;
    this.categoryId = data.categoryId;
    this.amount = data.amount;
    this.note = data.note;
    this.familyId = data.familyId;
    this.recordedAt = data.recordedAt;
    this.paymentMethodId = data.paymentMethodId;
    this.status = data.status;
  }
}
