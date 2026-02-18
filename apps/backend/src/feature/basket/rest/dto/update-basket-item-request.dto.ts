import {
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateBasketItemRequestDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @Min(0.001)
  @IsOptional()
  @Type(() => Number)
  quantity?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  price?: number | null;

  @IsUUID()
  @IsOptional()
  categoryId?: string | null;

  @IsString()
  @IsOptional()
  notes?: string | null;
}
