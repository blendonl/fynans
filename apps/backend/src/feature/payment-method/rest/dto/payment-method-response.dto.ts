import { PaymentMethod } from '../../core/domain/entities/payment-method.entity';
import { PaymentMethodType } from '../../core/domain/value-objects/payment-method-type.enum';

export class PaymentMethodResponseDto {
  id: string;
  userId: string;
  name: string;
  type: PaymentMethodType;
  color: string;
  initialBalance: number;
  currentBalance: number;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(paymentMethod: PaymentMethod): PaymentMethodResponseDto {
    const dto = new PaymentMethodResponseDto();
    dto.id = paymentMethod.id;
    dto.userId = paymentMethod.userId;
    dto.name = paymentMethod.name;
    dto.type = paymentMethod.type;
    dto.color = paymentMethod.color;
    dto.initialBalance = Number(paymentMethod.initialBalance);
    dto.currentBalance = Number(paymentMethod.currentBalance);
    dto.createdAt = paymentMethod.createdAt;
    dto.updatedAt = paymentMethod.updatedAt;
    return dto;
  }

  static fromEntities(
    paymentMethods: PaymentMethod[],
  ): PaymentMethodResponseDto[] {
    return paymentMethods.map((pm) => this.fromEntity(pm));
  }
}
