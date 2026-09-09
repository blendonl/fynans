import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';

export class UpdatePendingExpenseDto {
  categoryId?: string;
  storeId?: string | null;
  amount?: Decimal;
  recordedAt?: Date;
  paymentMethodId?: string | null;

  constructor(data: Partial<UpdatePendingExpenseDto>) {
    Object.assign(this, data);
  }
}
