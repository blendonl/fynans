import { Family } from '../entities/family.entity';
import { FamilyMember, FamilyMemberRole } from '../entities/family-member.entity';
import { User } from '../../../../user/core/domain/entities/user.entity';
import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';

export interface FamilyWithMembersAndUsers {
  family: Family;
  membersWithUsers: Array<{ member: FamilyMember; user: User }>;
}

export interface FamilyBalanceSnapshot {
  familyId: string;
  balance: Decimal;
  memberBalances: Map<string, Decimal>;
}

export interface IFamilyRepository {
  create(data: Partial<Family>): Promise<Family>;
  findById(id: string): Promise<Family | null>;
  findByIdWithMembers(id: string): Promise<FamilyWithMembersAndUsers | null>;
  findByUserId(userId: string): Promise<Family[]>;
  update(id: string, data: Partial<Family>): Promise<Family>;
  delete(id: string): Promise<void>;

  addMember(member: Partial<FamilyMember>): Promise<FamilyMember>;
  removeMember(familyId: string, userId: string): Promise<void>;
  findMember(familyId: string, userId: string): Promise<FamilyMember | null>;
  findMembers(familyId: string): Promise<FamilyMember[]>;
  updateMemberRole(
    familyId: string,
    userId: string,
    role: FamilyMemberRole,
  ): Promise<FamilyMember>;
  incrementBalances(
    familyId: string,
    userId: string,
    delta: Decimal,
  ): Promise<void>;

  recalculateBalances(familyId: string): Promise<FamilyBalanceSnapshot>;
  readBalances(familyId: string): Promise<FamilyBalanceSnapshot>;
  computeBalances(familyId: string): Promise<FamilyBalanceSnapshot>;
  findAllIds(): Promise<string[]>;
}
