import { IsUUID, IsNotEmpty } from 'class-validator';
import { CreateIncomeDto } from '../../core/application/dto/create-income.dto';

export class CreateIncomeRequestDto {
  @IsUUID()
  @IsNotEmpty()
  transactionId!: string;

  @IsUUID()
  @IsNotEmpty()
  storeId!: string;

  @IsUUID()
  @IsNotEmpty()
  categoryId!: string;

  toCoreDto(): CreateIncomeDto {
    return new CreateIncomeDto(
      this.transactionId,
      this.storeId,
      this.categoryId,
    );
  }
}
