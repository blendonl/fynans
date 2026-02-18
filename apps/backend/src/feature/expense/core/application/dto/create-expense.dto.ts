import { CreateExpenseItemDto } from '../../../../expense-item/core/application/dto/create-expense-item.dto';

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
  }
}
