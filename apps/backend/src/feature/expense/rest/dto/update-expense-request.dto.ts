import {
  IsUUID,
  IsOptional,
  IsNumber,
  IsString,
  IsDateString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateExpenseDto } from '../../core/application/dto/update-expense.dto';

export class UpdateExpenseRequestDto {
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsUUID()
  @IsOptional()
  storeId?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  amount?: number;

  @IsString()
  @IsOptional()
  note?: string;

  @IsDateString()
  @IsOptional()
  recordedAt?: string;

  @IsUUID()
  @IsOptional()
  paymentMethodId?: string | null;

  toCoreDto(): UpdateExpenseDto {
    return new UpdateExpenseDto({
      categoryId: this.categoryId,
      storeId: this.storeId,
      amount: this.amount,
      note: this.note,
      recordedAt: this.recordedAt ? new Date(this.recordedAt) : undefined,
      paymentMethodId: this.paymentMethodId,
    });
  }
}
