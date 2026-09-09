import { ApiProperty } from '@nestjs/swagger';
import { FamilyBalanceReconciliation } from '../../core/application/dto/family-balance-reconciliation.dto';

export class BalanceDriftDto {
  @ApiProperty()
  cached: number;

  @ApiProperty()
  computed: number;

  @ApiProperty()
  drift: number;
}

export class MemberBalanceDriftDto extends BalanceDriftDto {
  @ApiProperty()
  userId: string;
}

export class FamilyBalanceReconciliationResponseDto {
  @ApiProperty()
  familyId: string;

  @ApiProperty({ type: () => BalanceDriftDto })
  family: BalanceDriftDto;

  @ApiProperty({ type: () => [MemberBalanceDriftDto] })
  members: MemberBalanceDriftDto[];

  @ApiProperty()
  isBalanced: boolean;

  @ApiProperty()
  repaired: boolean;

  static fromReconciliation(
    reconciliation: FamilyBalanceReconciliation,
  ): FamilyBalanceReconciliationResponseDto {
    const dto = new FamilyBalanceReconciliationResponseDto();
    dto.familyId = reconciliation.familyId;
    dto.family = {
      cached: reconciliation.family.cached.toNumber(),
      computed: reconciliation.family.computed.toNumber(),
      drift: reconciliation.family.drift.toNumber(),
    };
    dto.members = reconciliation.members.map((member) => ({
      userId: member.userId,
      cached: member.cached.toNumber(),
      computed: member.computed.toNumber(),
      drift: member.drift.toNumber(),
    }));
    dto.isBalanced = reconciliation.isBalanced;
    dto.repaired = reconciliation.repaired;
    return dto;
  }
}
