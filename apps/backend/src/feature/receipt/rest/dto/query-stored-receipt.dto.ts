import { IsUUID, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryStoredReceiptDto {
  @IsUUID()
  @IsOptional()
  familyId?: string;

  @IsUUID()
  @IsOptional()
  expenseId?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}
