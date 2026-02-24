export class ResubmitExpenseDto {
  categoryId?: string;
  amount?: number;
  recordedAt?: Date;
  paymentMethodId?: string | null;

  constructor(data: Partial<ResubmitExpenseDto>) {
    Object.assign(this, data);
  }
}
