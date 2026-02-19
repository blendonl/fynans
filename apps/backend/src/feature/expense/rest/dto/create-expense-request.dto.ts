import {
  IsUUID,
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  IsOptional,
  ValidateNested,
  ArrayMinSize,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateExpenseItemRequestDto {
  @IsUUID()
  @IsNotEmpty()
  categoryId!: string;

  @IsString()
  @IsNotEmpty()
  itemName!: string;

  @IsNumber()
  @Min(0)
  itemPrice!: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number;

  @IsNumber()
  @Min(0.001)
  @Type(() => Number)
  quantity!: number;

  @IsNumber()
  @Min(0.001)
  @IsOptional()
  @Type(() => Number)
  sizeValue?: number;

  @IsString()
  @IsOptional()
  sizeUnit?: string;
}

export class CreateExpenseRequestDto {
  @IsUUID()
  @IsNotEmpty()
  categoryId!: string;

  @IsString()
  @IsOptional()
  storeName?: string;

  @IsString()
  @IsOptional()
  storeLocation?: string;

  @ValidateNested({ each: true })
  @Type(() => CreateExpenseItemRequestDto)
  @IsOptional()
  items?: CreateExpenseItemRequestDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsUUID()
  familyId?: string;

  @IsOptional()
  @IsString()
  scope?: 'PERSONAL' | 'FAMILY';

  @IsOptional()
  @IsDateString()
  recordedAt?: string;
}
