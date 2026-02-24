import { CreateExpenseItemDto } from '../../../../expense-item/core/application/dto/create-expense-item.dto';

export class ResubmitExpenseDto {
  categoryId?: string;
  storeId?: string | null;
  items?: CreateExpenseItemDto[];
  amount?: number;
  note?: string;
  recordedAt?: Date;
  paymentMethodId?: string | null;

  constructor(data: Partial<ResubmitExpenseDto>) {
    Object.assign(this, data);
  }
}
