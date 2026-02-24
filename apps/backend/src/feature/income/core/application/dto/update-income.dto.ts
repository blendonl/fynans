export class UpdateIncomeDto {
  categoryId?: string;
  amount?: number;
  recordedAt?: Date;
  paymentMethodId?: string | null;

  constructor(data: {
    categoryId?: string;
    amount?: number;
    recordedAt?: Date;
    paymentMethodId?: string | null;
  }) {
    this.categoryId = data.categoryId;
    this.amount = data.amount;
    this.recordedAt = data.recordedAt;
    this.paymentMethodId = data.paymentMethodId;
  }
}
