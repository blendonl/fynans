export class UpdatePendingExpenseDto {
  categoryId?: string;
  storeId?: string | null;
  amount?: number;
  recordedAt?: Date;
  paymentMethodId?: string | null;

  constructor(data: Partial<UpdatePendingExpenseDto>) {
    Object.assign(this, data);
  }
}
