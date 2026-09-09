import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';

export class ResubmitExpenseDto {
  categoryId?: string;
  amount?: Decimal;
  recordedAt?: Date;
  paymentMethodId?: string | null;

  constructor(data: Partial<ResubmitExpenseDto>) {
    Object.assign(this, data);
  }
}
