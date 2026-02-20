import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  Matches,
} from 'class-validator';
import { PaymentMethodType } from '../../core/domain/value-objects/payment-method-type.enum';

export class CreatePaymentMethodRequestDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEnum(PaymentMethodType, {
    message: `Type must be one of: ${Object.values(PaymentMethodType).join(', ')}`,
  })
  type!: PaymentMethodType;

  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Color must be a valid hex color (e.g. #6366F1)',
  })
  color?: string;

  @IsNumber()
  @IsOptional()
  initialBalance?: number;
}
