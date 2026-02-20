import { IsEnum, IsNotEmpty, IsNumber, IsUUID, Min, IsOptional, IsDateString } from 'class-validator';
import { TransactionType } from '../../core/domain/value-objects/transaction-type.vo';
import { CreateTransactionDto } from '../../core/application/dto/create-transaction.dto';

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

  toCoreDto(userId: string): CreateTransactionDto {
    return new CreateTransactionDto(
      userId,
      this.type,
      this.value,
      this.recordedAt ? new Date(this.recordedAt) : undefined,
      this.familyId,
    );
  }
}
