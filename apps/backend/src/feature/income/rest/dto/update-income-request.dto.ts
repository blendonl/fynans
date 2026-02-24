import {
  IsUUID,
  IsOptional,
  IsNumber,
  IsDateString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateIncomeDto } from '../../core/application/dto/update-income.dto';

export class UpdateIncomeRequestDto {
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  amount?: number;

  @IsDateString()
  @IsOptional()
  recordedAt?: string;

  @IsUUID()
  @IsOptional()
  paymentMethodId?: string | null;

  toCoreDto(): UpdateIncomeDto {
    return new UpdateIncomeDto({
      categoryId: this.categoryId,
      amount: this.amount,
      recordedAt: this.recordedAt ? new Date(this.recordedAt) : undefined,
      paymentMethodId: this.paymentMethodId,
    });
  }
}
