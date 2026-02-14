import {
  IsDateString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsNumber,
  IsInt,
  IsString,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionScope } from '../../../transaction/core/domain/entities/transaction.entity';

export enum TrendGroupBy {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

export class QueryExpenseTrendsDto {
  @IsDateString()
  dateFrom: string;

  @IsDateString()
  dateTo: string;

  @IsEnum(TrendGroupBy)
  @IsOptional()
  groupBy?: TrendGroupBy = TrendGroupBy.DAY;

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

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  valueMin?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  valueMax?: number;

  @IsString()
  @IsOptional()
  search?: string;

  @IsInt()
  @Min(2)
  @Max(20)
  @IsOptional()
  @Type(() => Number)
  maxLabels?: number;
}
