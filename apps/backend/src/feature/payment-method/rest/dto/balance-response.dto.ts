import { ApiProperty } from '@nestjs/swagger';

export class PaymentMethodBalanceDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  color: string;

  @ApiProperty()
  currentBalance: number;
}

export class FamilyBalanceDto {
  @ApiProperty()
  familyId: string;

  @ApiProperty()
  familyName: string;

  @ApiProperty()
  totalBalance: number;

  @ApiProperty()
  userContribution: number;
}

export class BalanceResponseDto {
  @ApiProperty()
  totalBalance: number;

  @ApiProperty()
  personalBalance: number;

  @ApiProperty({ type: [PaymentMethodBalanceDto] })
  paymentMethods: PaymentMethodBalanceDto[];

  @ApiProperty({ type: [FamilyBalanceDto] })
  families: FamilyBalanceDto[];
}
