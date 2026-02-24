import { ApiProperty } from '@nestjs/swagger';

export class ExpenseTrendPointResponseDto {
  @ApiProperty()
  date: string;

  @ApiProperty()
  total: number;

  @ApiProperty()
  count: number;

  @ApiProperty()
  showLabel: boolean;
}
