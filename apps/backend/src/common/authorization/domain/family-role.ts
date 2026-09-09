import { FamilyMemberRole } from '~feature/family/core/domain/entities/family-member.entity';

export { FamilyMemberRole };

export const FAMILY_ROLE_RANK: Record<FamilyMemberRole, number> = {
  [FamilyMemberRole.MEMBER]: 0,
  [FamilyMemberRole.ADMIN]: 1,
  [FamilyMemberRole.OWNER]: 2,
};
