import { IsUUID, IsNotEmpty, IsOptional } from 'class-validator';
import { CreateIncomeDto } from '../../core/application/dto/create-income.dto';

export class LinkIncomeRequestDto {
  @IsUUID()
  @IsNotEmpty()
  transactionId!: string;

  @IsUUID()
  @IsNotEmpty()
  categoryId!: string;

  @IsUUID()
  @IsOptional()
  storeId?: string;

  toCoreDto(userId: string): CreateIncomeDto {
    return new CreateIncomeDto(
      this.transactionId,
      this.categoryId,
      userId,
      this.storeId,
    );
  }
}
