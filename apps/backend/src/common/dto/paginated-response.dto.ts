import { ApiProperty } from '@nestjs/swagger';

export class PaginatedMetaDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}

/**
 * Use by extending and adding a `data` property with `@ApiProperty({ type: [YourDto] })`.
 *
 * Example:
 * ```
 * export class PaginatedExpenseResponseDto extends PaginatedMetaDto {
 *   @ApiProperty({ type: [ExpenseResponseDto] })
 *   data: ExpenseResponseDto[];
 * }
 * ```
 */
export { PaginatedMetaDto as PaginatedResponseBase };
