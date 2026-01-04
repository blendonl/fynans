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
  @Type(() => Number)
  quantity!: number;
}

export class CreateExpenseRequestDto {
  @IsUUID()
  @IsNotEmpty()
  categoryId!: string;

  @IsString()
  @IsNotEmpty()
  storeName!: string;

  @IsString()
  @IsNotEmpty()
  storeLocation!: string;

  @ValidateNested({ each: true })
  @Type(() => CreateExpenseItemRequestDto)
  @ArrayMinSize(1)
  items!: CreateExpenseItemRequestDto[];

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
