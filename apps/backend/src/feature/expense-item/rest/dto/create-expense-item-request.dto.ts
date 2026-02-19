import { IsUUID, IsNotEmpty, IsString, IsNumber, Min, IsOptional } from 'class-validator';

export class CreateExpenseItemRequestDto {
  @IsUUID()
  @IsNotEmpty()
  expenseId!: string;

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
  @IsOptional()
  quantity?: number;

  @IsUUID()
  @IsOptional()
  itemId?: string;
}
