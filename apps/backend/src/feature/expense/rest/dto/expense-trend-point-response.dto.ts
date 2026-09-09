import { ApiProperty } from '@nestjs/swagger';
import { ExpenseTrendPoint } from '../../core/application/dto/expense-trends.dto';

export class ExpenseTrendPointResponseDto {
  @ApiProperty()
  date: string;

  @ApiProperty()
  total: number;

  @ApiProperty()
  count: number;

  @ApiProperty()
  showLabel: boolean;

  static fromPoint(point: ExpenseTrendPoint): ExpenseTrendPointResponseDto {
    const dto = new ExpenseTrendPointResponseDto();
    dto.date = point.date;
    dto.total = point.total.toNumber();
    dto.count = point.count;
    dto.showLabel = point.showLabel;
    return dto;
  }

  static fromPoints(
    points: ExpenseTrendPoint[],
  ): ExpenseTrendPointResponseDto[] {
    return points.map((point) => this.fromPoint(point));
  }
}
