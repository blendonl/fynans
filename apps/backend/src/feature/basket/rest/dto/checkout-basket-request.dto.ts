import {
  IsArray,
  IsUUID,
  IsNotEmpty,
  ArrayMinSize,
  IsOptional,
  IsDateString,
  IsNumber,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ItemOverrideDto {
  @IsUUID()
  id!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.001)
  quantity?: number;

  @IsOptional()
  @IsUUID()
  categoryId?: string;
}

export class CheckoutBasketRequestDto {
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMinSize(1)
  itemIds!: string[];

  @IsUUID()
  @IsNotEmpty()
  categoryId!: string;

  @IsOptional()
  @IsUUID()
  storeId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemOverrideDto)
  itemOverrides?: ItemOverrideDto[];

  @IsOptional()
  @IsDateString()
  recordedAt?: string;
}
