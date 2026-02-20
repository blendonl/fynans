import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { PaymentMethodType } from '../../domain/value-objects/payment-method-type.enum';

export class CreatePaymentMethodDto {
  @IsString()
  userId: string;

  @IsString()
  name: string;

  @IsEnum(PaymentMethodType)
  type: PaymentMethodType;

  @IsString()
  @IsOptional()
  color?: string;

  @IsNumber()
  @IsOptional()
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
