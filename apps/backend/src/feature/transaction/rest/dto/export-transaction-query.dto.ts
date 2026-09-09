import { IsIn, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { QueryTransactionDto } from './query-transaction.dto';

export const EXPORT_FORMATS = ['csv'] as const;

export type ExportFormat = (typeof EXPORT_FORMATS)[number];

export class ExportTransactionQueryDto extends QueryTransactionDto {
  @ApiPropertyOptional({ enum: EXPORT_FORMATS, default: 'csv' })
  @IsIn(EXPORT_FORMATS)
  @IsOptional()
  format?: ExportFormat = 'csv';
}
