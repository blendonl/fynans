import { ApiProperty } from '@nestjs/swagger';
import { ExpenseCategoryResponseDto } from './expense-category-response.dto';

export class PaginatedExpenseCategoryResponseDto {
  @ApiProperty({ type: () => [ExpenseCategoryResponseDto] })
  data: ExpenseCategoryResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}
