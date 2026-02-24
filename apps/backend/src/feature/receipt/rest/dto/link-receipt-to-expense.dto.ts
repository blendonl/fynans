import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LinkReceiptToExpenseDto {
  @ApiProperty({ description: 'UUID of the expense to link' })
  @IsUUID()
  expenseId: string;
}
