import {
  IsEnum,
  IsUUID,
  IsOptional,
  IsDateString,
  IsNumber,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { TransactionType } from '../../core/domain/value-objects/transaction-type.vo';
import { TransactionStatus } from '../../core/domain/value-objects/transaction-status.vo';
import { TransactionScope } from '../../core/domain/entities/transaction.entity';

export class QueryTransactionDto {
  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsEnum(TransactionType)
  @IsOptional()
  type?: TransactionType;

  @IsUUID()
  @IsOptional()
  familyId?: string;

  @IsEnum(TransactionScope)
  @IsOptional()
  scope?: TransactionScope;

  @IsEnum(TransactionStatus)
  @IsOptional()
  status?: TransactionStatus;

  @IsUUID()
  @IsOptional()
  paymentMethodId?: string;

  @IsDateString()
  @IsOptional()
  dateFrom?: string;

  @IsDateString()
  @IsOptional()
  dateTo?: string;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  valueMin?: number;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  valueMax?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : 1))
  page?: number = 1;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : 10))
  limit?: number = 10;
}
