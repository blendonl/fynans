import { PaymentMethodType } from '../../domain/value-objects/payment-method-type.vo';

export class UpdatePaymentMethodDto {
  name?: string;
  type?: PaymentMethodType;
  color?: string;
  initialBalance?: number;

  constructor(data: {
    name?: string;
    type?: PaymentMethodType;
    color?: string;
    initialBalance?: number;
  }) {
    this.name = data.name;
    this.type = data.type;
    this.color = data.color;
    this.initialBalance = data.initialBalance;
  }
}
