import { CreateExpenseItemDto } from '../../../../expense-item/core/application/dto/create-expense-item.dto';
import { TransactionStatus } from '../../../../transaction/core/domain/value-objects/transaction-status.vo';

export class CreateExpenseDto {
  userId: string;
  categoryId: string;
  storeName?: string;
  storeLocation?: string;
  storeId?: string;
  items?: CreateExpenseItemDto[];
  amount?: number;
  note?: string;
  familyId?: string;
  scope?: 'PERSONAL' | 'FAMILY';
  recordedAt?: Date;
  paymentMethodId?: string;
  status?: TransactionStatus;

  constructor(data: {
    userId: string;
    categoryId: string;
    storeName?: string;
    storeLocation?: string;
    storeId?: string;
    items?: CreateExpenseItemDto[];
    amount?: number;
    note?: string;
    familyId?: string;
    recordedAt?: Date;
    paymentMethodId?: string;
    status?: TransactionStatus;
  }) {
    this.userId = data.userId;
    this.categoryId = data.categoryId;
    this.storeName = data.storeName;
    this.storeLocation = data.storeLocation;
    this.storeId = data.storeId;
    this.items = data.items;
    this.amount = data.amount;
    this.note = data.note;
    this.familyId = data.familyId;
    this.recordedAt = data.recordedAt;
    this.paymentMethodId = data.paymentMethodId;
    this.status = data.status;
  }
}
