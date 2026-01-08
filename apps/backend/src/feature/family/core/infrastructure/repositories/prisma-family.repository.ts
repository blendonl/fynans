import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../common/prisma/prisma.service';
import {
  IFamilyRepository,
  FamilyWithMembersAndUsers,
} from '../../domain/repositories/family.repository.interface';
import { Family } from '../../domain/entities/family.entity';
import {
  FamilyMember,
  FamilyMemberRole,
} from '../../domain/entities/family-member.entity';
import { FamilyMapper } from '../mappers/family.mapper';
import { FamilyMemberMapper } from '../mappers/family-member.mapper';
import { UserMapper } from '../../../../user/core/infrastructure/mappers/user.mapper';
import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';

@Injectable()
export class PrismaFamilyRepository implements IFamilyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Partial<Family>): Promise<Family> {
    const family = await this.prisma.family.create({
      data: {
        name: data.name!,
        balance: new Decimal(data.balance || 0),
      },
    });

    return FamilyMapper.toDomain(family);
  }

  async findById(id: string): Promise<Family | null> {
    const family = await this.prisma.family.findUnique({
      where: { id },
    });

    return family ? FamilyMapper.toDomain(family) : null;
  }

  async findByIdWithMembers(
    id: string,
  ): Promise<FamilyWithMembersAndUsers | null> {
    const familyWithMembers = await this.prisma.family.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: true,
          },
          orderBy: { joinedAt: 'asc' },
        },
      },
    });

    if (!familyWithMembers) {
      return null;
    }

    const family = FamilyMapper.toDomain(familyWithMembers);
    const membersWithUsers = familyWithMembers.members.map((m) => ({
      member: FamilyMemberMapper.toDomain(m),
      user: UserMapper.toDomain(m.user),
    }));

    return {
      family,
      membersWithUsers,
    };
  }

  async findByUserId(userId: string): Promise<Family[]> {
    const families = await this.prisma.family.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return families.map(FamilyMapper.toDomain);
  }

  async update(id: string, data: Partial<Family>): Promise<Family> {
    const updateData: any = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.balance !== undefined) {
      updateData.balance = new Decimal(data.balance);
    }

    const family = await this.prisma.family.update({
      where: { id },
      data: updateData,
    });

    return FamilyMapper.toDomain(family);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.family.delete({
      where: { id },
    });
  }

  async addMember(member: Partial<FamilyMember>): Promise<FamilyMember> {
    const created = await this.prisma.familyMember.create({
      data: {
        familyId: member.familyId!,
        userId: member.userId!,
        role: member.role as any,
        balance: new Decimal(member.balance || 0),
      },
    });

    return FamilyMemberMapper.toDomain(created);
  }

  async removeMember(familyId: string, userId: string): Promise<void> {
    await this.prisma.familyMember.delete({
      where: {
        familyId_userId: { familyId, userId },
      },
    });
  }

  async findMember(
    familyId: string,
    userId: string,
  ): Promise<FamilyMember | null> {
    const member = await this.prisma.familyMember.findUnique({
      where: {
        familyId_userId: { familyId, userId },
      },
    });

    return member ? FamilyMemberMapper.toDomain(member) : null;
  }

  async findMembers(familyId: string): Promise<FamilyMember[]> {
    const members = await this.prisma.familyMember.findMany({
      where: { familyId },
      orderBy: { joinedAt: 'asc' },
    });

    return members.map((m) => FamilyMemberMapper.toDomain(m));
  }

  async updateMemberRole(
    familyId: string,
    userId: string,
    role: FamilyMemberRole,
  ): Promise<FamilyMember> {
    const member = await this.prisma.familyMember.update({
      where: {
        familyId_userId: { familyId, userId },
      },
      data: {
        role: role as any,
      },
    });

    return FamilyMemberMapper.toDomain(member);
  }

  async updateMemberBalance(
    familyId: string,
    userId: string,
    balance: number,
  ): Promise<void> {
    await this.prisma.familyMember.update({
      where: {
        familyId_userId: { familyId, userId },
      },
      data: {
        balance: new Decimal(balance),
      },
    });
  }

  async updateFamilyBalance(familyId: string, balance: number): Promise<void> {
    await this.prisma.family.update({
      where: { id: familyId },
      data: {
        balance: new Decimal(balance),
      },
    });
  }

  async calculateFamilyBalance(familyId: string): Promise<number> {
    const incomeSum = await this.prisma.transaction.aggregate({
      where: { familyId, scope: 'FAMILY', type: 'INCOME' },
      _sum: { value: true },
    });

    const expenseSum = await this.prisma.transaction.aggregate({
      where: { familyId, scope: 'FAMILY', type: 'EXPENSE' },
      _sum: { value: true },
    });

    return (
      (incomeSum._sum.value?.toNumber() || 0) -
      (expenseSum._sum.value?.toNumber() || 0)
    );
  }
}
