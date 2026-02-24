import { IsUUID, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ProcessReceiptBodyDto {
  @ApiPropertyOptional({ description: 'Family ID to assign the receipt to' })
  @IsUUID()
  @IsOptional()
  familyId?: string;

  @ApiPropertyOptional({ description: 'Auto-create a pending expense from the receipt' })
  @IsString()
  @IsOptional()
  autoCreatePending?: string | boolean;

  @ApiPropertyOptional({ description: 'Payment method ID for auto-created pending expense' })
  @IsUUID()
  @IsOptional()
  paymentMethodId?: string;
}
