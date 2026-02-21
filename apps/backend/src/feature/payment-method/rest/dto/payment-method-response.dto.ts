import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '../../core/domain/entities/payment-method.entity';
import { PaymentMethodType } from '../../core/domain/value-objects/payment-method-type.enum';

export class PaymentMethodResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: PaymentMethodType })
  type: PaymentMethodType;

  @ApiProperty()
  color: string;

  @ApiProperty()
  initialBalance: number;

  @ApiProperty()
  currentBalance: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
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
