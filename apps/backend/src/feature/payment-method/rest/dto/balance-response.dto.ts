import { ApiProperty } from '@nestjs/swagger';
import { BalanceResult } from '../../core/application/use-cases/get-balance.use-case';

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

  static fromResult(result: BalanceResult): BalanceResponseDto {
    const dto = new BalanceResponseDto();
    dto.totalBalance = result.totalBalance.toNumber();
    dto.personalBalance = result.personalBalance.toNumber();
    dto.paymentMethods = result.paymentMethods.map((paymentMethod) => ({
      id: paymentMethod.id,
      name: paymentMethod.name,
      type: paymentMethod.type,
      color: paymentMethod.color,
      currentBalance: paymentMethod.currentBalance.toNumber(),
    }));
    dto.families = result.families.map((family) => ({
      familyId: family.familyId,
      familyName: family.familyName,
      totalBalance: family.totalBalance.toNumber(),
      userContribution: family.userContribution.toNumber(),
    }));
    return dto;
  }
}
