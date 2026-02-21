import { IsString, IsOptional, IsNumber, IsEnum, Matches, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethodType } from '../../core/domain/value-objects/payment-method-type.enum';

export class UpdatePaymentMethodRequestDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MinLength(1)
  name?: string;

  @ApiPropertyOptional({ enum: PaymentMethodType })
  @IsEnum(PaymentMethodType, {
    message: `Type must be one of: ${Object.values(PaymentMethodType).join(', ')}`,
  })
  @IsOptional()
  type?: PaymentMethodType;

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
