import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { FamilyMemberRole } from '../../domain/family-role';
import { IFamilyMembershipRepository } from '../../domain/repositories/family-membership.repository.interface';

@Injectable()
export class PrismaFamilyMembershipRepository implements IFamilyMembershipRepository {
  constructor(private readonly prisma: PrismaService) {}

  async isMember(familyId: string, userId: string): Promise<boolean> {
    const membership = await this.prisma.familyMember.findUnique({
      where: { familyId_userId: { familyId, userId } },
      select: { id: true },
    });

    return membership !== null;
  }

  async findRole(
    familyId: string,
    userId: string,
  ): Promise<FamilyMemberRole | null> {
    const membership = await this.prisma.familyMember.findUnique({
      where: { familyId_userId: { familyId, userId } },
      select: { role: true },
    });

    return membership ? (membership.role as FamilyMemberRole) : null;
  }

  async findFamilyIds(userId: string): Promise<string[]> {
    const memberships = await this.prisma.familyMember.findMany({
      where: { userId },
      select: { familyId: true },
    });

    return memberships.map((membership) => membership.familyId);
  }

  async findCoMemberUserIds(userId: string): Promise<string[]> {
    const familyIds = await this.findFamilyIds(userId);

    if (familyIds.length === 0) {
      return [userId];
    }

    const members = await this.prisma.familyMember.findMany({
      where: { familyId: { in: familyIds } },
      select: { userId: true },
    });

    return [...new Set([userId, ...members.map((member) => member.userId)])];
  }
}
