import {
  IsUUID,
  IsNumber,
  IsDateString,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';
import { UpdatePendingExpenseDto } from '../../core/application/dto/update-pending-expense.dto';

export class UpdatePendingExpenseRequestDto {
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsUUID()
  @IsOptional()
  storeId?: string | null;

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

  toCoreDto(): UpdatePendingExpenseDto {
    return new UpdatePendingExpenseDto({
      categoryId: this.categoryId,
      storeId: this.storeId,
      amount: this.amount !== undefined ? new Decimal(this.amount) : undefined,
      recordedAt: this.recordedAt ? new Date(this.recordedAt) : undefined,
      paymentMethodId: this.paymentMethodId,
    });
  }
}
