import { ApiProperty } from '@nestjs/swagger';
import { ExpenseCategoryResponseDto } from './expense-category-response.dto';

export class ExpenseCategoryTreeNodeDto {
  @ApiProperty({ type: () => ExpenseCategoryResponseDto })
  category: ExpenseCategoryResponseDto;

  @ApiProperty({ type: () => [ExpenseCategoryTreeNodeDto] })
  children: ExpenseCategoryTreeNodeDto[];
}
