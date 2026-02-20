import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { TransactionType } from '../../core/domain/value-objects/transaction-type.vo';
import { UpdateTransactionDto } from '../../core/application/dto/update-transaction.dto';

export class UpdateTransactionRequestDto {
  @IsEnum(TransactionType)
  @IsOptional()
  type?: TransactionType;

  @IsNumber()
  @Min(0.01)
  @IsOptional()
  value?: number;

  toCoreDto(): UpdateTransactionDto {
    return new UpdateTransactionDto({
      type: this.type,
      value: this.value,
    });
  }
}
