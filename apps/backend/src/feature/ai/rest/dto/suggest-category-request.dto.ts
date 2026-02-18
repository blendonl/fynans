import { IsIn, IsOptional, IsArray, IsString } from 'class-validator';

export class SuggestCategoryRequestDto {
  @IsIn(['item', 'expense', 'income'])
  type: 'item' | 'expense' | 'income';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  itemNames?: string[];

  @IsOptional()
  @IsString()
  note?: string;
}
