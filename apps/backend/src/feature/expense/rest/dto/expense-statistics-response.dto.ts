import { ApiProperty } from '@nestjs/swagger';
import { type ExpenseStatistics } from '../../core/application/dto/expense-statistics.dto';

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

  static fromStatistics(
    statistics: ExpenseStatistics,
  ): ExpenseStatisticsResponseDto {
    const dto = new ExpenseStatisticsResponseDto();
    dto.totalExpenses = statistics.totalExpenses.toNumber();
    dto.expenseCount = statistics.expenseCount;
    dto.averageExpense = statistics.averageExpense.toNumber();
    dto.expensesByCategory = statistics.expensesByCategory.map((category) => ({
      categoryId: category.categoryId,
      categoryName: category.categoryName,
      total: category.total.toNumber(),
    }));
    dto.expensesByStore = statistics.expensesByStore.map((store) => ({
      storeId: store.storeId,
      total: store.total.toNumber(),
    }));
    return dto;
  }
}
