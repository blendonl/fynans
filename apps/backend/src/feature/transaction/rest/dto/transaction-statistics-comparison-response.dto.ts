import { ApiProperty } from '@nestjs/swagger';

class DeltaComparisonResponseDto {
  @ApiProperty()
  delta: number;

  @ApiProperty()
  percentage: number;
}

class StatisticsComparisonResponseDto {
  @ApiProperty({ type: DeltaComparisonResponseDto })
  income: DeltaComparisonResponseDto;

  @ApiProperty({ type: DeltaComparisonResponseDto })
  expense: DeltaComparisonResponseDto;

  @ApiProperty({ type: DeltaComparisonResponseDto })
  net: DeltaComparisonResponseDto;
}

class PeriodStatisticsResponseDto {
  @ApiProperty()
  totalIncome: number;

  @ApiProperty()
  totalExpense: number;

  @ApiProperty()
  balance: number;

  @ApiProperty()
  count: number;
}

export class TransactionStatisticsComparisonResponseDto {
  @ApiProperty({ type: PeriodStatisticsResponseDto })
  current: PeriodStatisticsResponseDto;

  @ApiProperty({ type: PeriodStatisticsResponseDto })
  previous: PeriodStatisticsResponseDto;

  @ApiProperty({ type: StatisticsComparisonResponseDto })
  comparison: StatisticsComparisonResponseDto;
}
