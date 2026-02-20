import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';
import { PaymentMethod } from '../entities/payment-method.entity';
import { PaymentMethodType } from '../value-objects/payment-method-type.enum';

export interface CreatePaymentMethodData {
  id: string;
  userId: string;
  name: string;
  type: PaymentMethodType;
  color?: string;
  initialBalance?: Decimal;
  currentBalance?: Decimal;
}

export interface UpdatePaymentMethodData {
  name?: string;
  type?: PaymentMethodType;
  color?: string;
  initialBalance?: Decimal;
  currentBalance?: Decimal;
}

export interface BalanceSummaryItem {
  id: string;
  name: string;
  color: string;
  currentBalance: Decimal;
}

export interface IPaymentMethodRepository {
  create(data: CreatePaymentMethodData): Promise<PaymentMethod>;
  findById(id: string): Promise<PaymentMethod | null>;
  findByUserIdAndName(userId: string, name: string): Promise<PaymentMethod | null>;
  findAllByUserId(userId: string): Promise<PaymentMethod[]>;
  update(id: string, data: UpdatePaymentMethodData): Promise<PaymentMethod>;
  delete(id: string): Promise<void>;
  recalculateBalance(id: string): Promise<PaymentMethod>;
  getBalanceSummary(userId: string): Promise<BalanceSummaryItem[]>;
}
