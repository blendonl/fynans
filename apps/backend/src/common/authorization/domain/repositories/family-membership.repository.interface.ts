export const FAMILY_MEMBERSHIP_REPOSITORY = 'FamilyMembershipRepository';

export interface IFamilyMembershipRepository {
  isMember(familyId: string, userId: string): Promise<boolean>;
  findFamilyIds(userId: string): Promise<string[]>;
  findCoMemberUserIds(userId: string): Promise<string[]>;
}
