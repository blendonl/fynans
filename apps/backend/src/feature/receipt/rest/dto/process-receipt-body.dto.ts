import { IsUUID, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ProcessReceiptBodyDto {
  @ApiPropertyOptional({ description: 'Family ID to assign the receipt to' })
  @IsUUID()
  @IsOptional()
  familyId?: string;
}
