import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethodType } from '../../core/domain/value-objects/payment-method-type.enum';

export class CreatePaymentMethodRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ enum: PaymentMethodType })
  @IsEnum(PaymentMethodType, {
    message: `Type must be one of: ${Object.values(PaymentMethodType).join(', ')}`,
  })
  type!: PaymentMethodType;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Color must be a valid hex color (e.g. #6366F1)',
  })
  color?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  initialBalance?: number;
}
