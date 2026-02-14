import { IsUUID, IsOptional, IsDateString, IsNumber, IsEnum, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionScope } from '../../../transaction/core/domain/entities/transaction.entity';

export class QueryIncomeDto {
  @IsString()
  @IsOptional()
  search?: string;
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsUUID()
  @IsOptional()
  storeId?: string;

  @IsUUID()
  @IsOptional()
  familyId?: string;

  @IsEnum(TransactionScope)
  @IsOptional()
  scope?: TransactionScope;

  @IsDateString()
  @IsOptional()
  dateFrom?: string;

  @IsDateString()
  @IsOptional()
  dateTo?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  valueMin?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  valueMax?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}
