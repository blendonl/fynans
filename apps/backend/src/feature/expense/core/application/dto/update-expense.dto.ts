export class UpdateExpenseDto {
  categoryId?: string;
  storeId?: string;
  amount?: number;
  description?: string;
  recordedAt?: Date;
  paymentMethodId?: string | null;

  constructor(data: {
    categoryId?: string;
    storeId?: string;
    amount?: number;
    description?: string;
    recordedAt?: Date;
    paymentMethodId?: string | null;
  }) {
    this.categoryId = data.categoryId;
    this.storeId = data.storeId;
    this.amount = data.amount;
    this.description = data.description;
    this.recordedAt = data.recordedAt;
    this.paymentMethodId = data.paymentMethodId;
  }
}
