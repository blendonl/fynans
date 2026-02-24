import { ApiProperty } from '@nestjs/swagger';

export class ExpenseByCategoryDto {
  @ApiProperty()
  categoryId: string;

  @ApiProperty()
  categoryName: string;

  @ApiProperty()
  total: number;
}

export class ExpenseByStoreDto {
  @ApiProperty()
  storeId: string;

  @ApiProperty()
  total: number;
}

export class ExpenseStatisticsResponseDto {
  @ApiProperty()
  totalExpenses: number;

  @ApiProperty()
  expenseCount: number;

  @ApiProperty()
  averageExpense: number;

  @ApiProperty({ type: () => [ExpenseByCategoryDto] })
  expensesByCategory: ExpenseByCategoryDto[];

  @ApiProperty({ type: () => [ExpenseByStoreDto] })
  expensesByStore: ExpenseByStoreDto[];
}
