import { ApiProperty } from '@nestjs/swagger';
import { ExpenseResponseDto } from './expense-response.dto';

export class PaginatedExpenseResponseDto {
  @ApiProperty({ type: () => [ExpenseResponseDto] })
  data: ExpenseResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}
