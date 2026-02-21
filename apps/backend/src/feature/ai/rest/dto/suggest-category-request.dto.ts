import { IsIn, IsOptional, IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SuggestCategoryRequestDto {
  @ApiProperty({ enum: ['item', 'expense', 'income'] })
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
