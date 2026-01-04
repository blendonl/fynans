import { CreateExpenseItemDto } from '../../../../expense-item/core/application/dto/create-expense-item.dto';

export class CreateExpenseDto {
  userId: string;
  categoryId: string;
  storeName: string;
  storeLocation: string;
  items: CreateExpenseItemDto[];
  familyId?: string;
  scope?: 'PERSONAL' | 'FAMILY';
  recordedAt?: Date;

  constructor(data: {
    userId: string;
    categoryId: string;
    storeName: string;
    storeLocation: string;
    items: CreateExpenseItemDto[];
    familyId?: string;
    recordedAt?: Date;
  }) {
    this.userId = data.userId;
    this.categoryId = data.categoryId;
    this.storeName = data.storeName;
    this.storeLocation = data.storeLocation;
    this.items = data.items;
    this.familyId = data.familyId;
    this.recordedAt = data.recordedAt;
  }
}
