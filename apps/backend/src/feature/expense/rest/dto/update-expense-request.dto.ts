import { IsUUID, IsOptional } from 'class-validator';
import { UpdateExpenseDto } from '../../core/application/dto/update-expense.dto';

export class UpdateExpenseRequestDto {
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsUUID()
  @IsOptional()
  storeId?: string;

  toCoreDto(): UpdateExpenseDto {
    return new UpdateExpenseDto({
      categoryId: this.categoryId,
      storeId: this.storeId,
    });
  }
}
