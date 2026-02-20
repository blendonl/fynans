import { IsEnum, IsNotEmpty, IsNumber, IsUUID, Min, IsOptional, IsDateString } from 'class-validator';
import { TransactionType } from '../../core/domain/value-objects/transaction-type.vo';

export class CreateTransactionRequestDto {
  @IsEnum(TransactionType)
  @IsNotEmpty()
  type!: TransactionType;

  @IsNumber()
  @Min(0.01)
  @IsNotEmpty()
  value!: number;

  @IsOptional()
  @IsDateString()
  recordedAt?: string;

  @IsOptional()
  @IsUUID()
  familyId?: string;

  @IsOptional()
  @IsUUID()
  paymentMethodId?: string;
}
