import { PaymentMethodType } from '../../domain/value-objects/payment-method-type.enum';

export class CreatePaymentMethodDto {
  userId: string;

  name: string;

  type: PaymentMethodType;

  color?: string;

  initialBalance?: number;

  constructor(
    userId: string,
    name: string,
    type: PaymentMethodType,
    color?: string,
    initialBalance?: number,
  ) {
    this.userId = userId;
    this.name = name;
    this.type = type;
    this.color = color;
    this.initialBalance = initialBalance;
  }
}
