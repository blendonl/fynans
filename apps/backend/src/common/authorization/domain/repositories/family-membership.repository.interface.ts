import { FamilyMemberRole } from '../family-role';

export const FAMILY_MEMBERSHIP_REPOSITORY = 'FamilyMembershipRepository';

export interface IFamilyMembershipRepository {
  isMember(familyId: string, userId: string): Promise<boolean>;
  findRole(familyId: string, userId: string): Promise<FamilyMemberRole | null>;
  findFamilyIds(userId: string): Promise<string[]>;
  findCoMemberUserIds(userId: string): Promise<string[]>;
}
