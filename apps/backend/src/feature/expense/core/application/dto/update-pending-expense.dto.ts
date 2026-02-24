import { CreateExpenseItemDto } from '../../../../expense-item/core/application/dto/create-expense-item.dto';

export class UpdatePendingExpenseDto {
  categoryId?: string;
  storeId?: string | null;
  storeName?: string;
  storeLocation?: string;
  items?: CreateExpenseItemDto[];
  amount?: number;
  note?: string;
  recordedAt?: Date;
  paymentMethodId?: string | null;

  constructor(data: Partial<UpdatePendingExpenseDto>) {
    Object.assign(this, data);
  }
}
