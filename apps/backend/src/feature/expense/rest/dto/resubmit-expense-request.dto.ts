import { IsUUID, IsNumber, IsDateString, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';
import { ResubmitExpenseDto } from '../../core/application/dto/resubmit-expense.dto';

export class ResubmitExpenseRequestDto {
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
  paymentMethodId?: string;

  toCoreDto(): ResubmitExpenseDto {
    return new ResubmitExpenseDto({
      categoryId: this.categoryId,
      amount: this.amount !== undefined ? new Decimal(this.amount) : undefined,
      recordedAt: this.recordedAt ? new Date(this.recordedAt) : undefined,
      paymentMethodId: this.paymentMethodId,
    });
  }
}
