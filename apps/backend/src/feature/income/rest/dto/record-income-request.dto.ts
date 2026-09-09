import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ToBoolean } from '~common/dto/to-boolean.transform';
import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';
import { RecordIncomeDto } from '../../core/application/dto/record-income.dto';
import { TransactionStatus } from '~feature/transaction/core/domain/value-objects/transaction-status.vo';

export class RecordIncomeRequestDto {
  @IsUUID()
  @IsNotEmpty()
  categoryId!: string;

  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  amount!: number;

  @IsString()
  @IsOptional()
  note?: string;

  @IsUUID()
  @IsOptional()
  familyId?: string;

  @IsDateString()
  @IsOptional()
  recordedAt?: string;

  @IsUUID()
  @IsOptional()
  paymentMethodId?: string;

  @IsBoolean()
  @IsOptional()
  @ToBoolean()
  pending?: boolean;

  toCoreDto(userId: string): RecordIncomeDto {
    return new RecordIncomeDto({
      userId,
      categoryId: this.categoryId,
      amount: new Decimal(this.amount),
      note: this.note,
      familyId: this.familyId,
      recordedAt: this.recordedAt ? new Date(this.recordedAt) : undefined,
      paymentMethodId: this.paymentMethodId,
      status: this.pending ? TransactionStatus.PENDING : undefined,
    });
  }
}
