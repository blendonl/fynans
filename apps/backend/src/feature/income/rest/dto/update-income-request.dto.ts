import { IsUUID, IsOptional } from 'class-validator';
import { UpdateIncomeDto } from '../../core/application/dto/update-income.dto';

export class UpdateIncomeRequestDto {
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  toCoreDto(): UpdateIncomeDto {
    return new UpdateIncomeDto({
      categoryId: this.categoryId,
    });
  }
}
