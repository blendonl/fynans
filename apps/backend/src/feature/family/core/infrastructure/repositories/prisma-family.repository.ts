import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../common/prisma/prisma.service';
import {
  IFamilyRepository,
  FamilyWithMembersAndUsers,
  FamilyBalanceSnapshot,
} from '../../domain/repositories/family.repository.interface';
import { DomainNotFoundException } from '~common/exceptions/domain.exceptions';
import {
  TransactionScope,
  TransactionStatus as PrismaTransactionStatus,
} from 'prisma/generated/prisma/client';
import { TransactionAmountNormalizer } from '~feature/transaction/core/domain/services/transaction-amount.normalizer';
import { TransactionType } from '~feature/transaction/core/domain/value-objects/transaction-type.vo';
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
    const family = await this.prisma.db.family.create({
      data: {
        name: data.name!,
        balance: data.balance ?? new Decimal(0),
      },
    });

    return FamilyMapper.toDomain(family);
  }

  async findById(id: string): Promise<Family | null> {
    const family = await this.prisma.db.family.findUnique({
      where: { id },
    });

    return family ? FamilyMapper.toDomain(family) : null;
  }

  async findByIdWithMembers(
    id: string,
  ): Promise<FamilyWithMembersAndUsers | null> {
    const familyWithMembers = await this.prisma.db.family.findUnique({
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
    const families = await this.prisma.db.family.findMany({
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
      updateData.balance = data.balance;
    }

    const family = await this.prisma.db.family.update({
      where: { id },
      data: updateData,
    });

    return FamilyMapper.toDomain(family);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.db.family.delete({
      where: { id },
    });
  }

  async addMember(member: Partial<FamilyMember>): Promise<FamilyMember> {
    const created = await this.prisma.db.familyMember.create({
      data: {
        familyId: member.familyId!,
        userId: member.userId!,
        role: member.role as any,
        balance: member.balance ?? new Decimal(0),
      },
    });

    return FamilyMemberMapper.toDomain(created);
  }

  async removeMember(familyId: string, userId: string): Promise<void> {
    await this.prisma.db.familyMember.delete({
      where: {
        familyId_userId: { familyId, userId },
      },
    });
  }

  async findMember(
    familyId: string,
    userId: string,
  ): Promise<FamilyMember | null> {
    const member = await this.prisma.db.familyMember.findUnique({
      where: {
        familyId_userId: { familyId, userId },
      },
    });

    return member ? FamilyMemberMapper.toDomain(member) : null;
  }

  async findMembershipsOfUser(userId: string): Promise<FamilyMember[]> {
    const members = await this.prisma.db.familyMember.findMany({
      where: { userId },
    });

    return members.map((m) => FamilyMemberMapper.toDomain(m));
  }

  async findMembers(familyId: string): Promise<FamilyMember[]> {
    const members = await this.prisma.db.familyMember.findMany({
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
    const member = await this.prisma.db.familyMember.update({
      where: {
        familyId_userId: { familyId, userId },
      },
      data: {
        role: role as any,
      },
    });

    return FamilyMemberMapper.toDomain(member);
  }

  async incrementBalances(
    familyId: string,
    userId: string,
    delta: Decimal,
  ): Promise<void> {
    await this.prisma.runInTransaction(async () => {
      const tx = this.prisma.db;

      const memberUpdate = await tx.familyMember.updateMany({
        where: { familyId, userId },
        data: { balance: { increment: delta } },
      });

      if (memberUpdate.count === 0) {
        throw new DomainNotFoundException('Not a family member');
      }

      const familyUpdate = await tx.family.updateMany({
        where: { id: familyId },
        data: { balance: { increment: delta } },
      });

      if (familyUpdate.count === 0) {
        throw new DomainNotFoundException('Family not found');
      }
    });
  }

  async recalculateBalances(familyId: string): Promise<FamilyBalanceSnapshot> {
    return this.prisma.runInTransaction(async () => {
      const tx = this.prisma.db;
      const computed = await this.computeBalances(familyId);

      for (const [userId, balance] of computed.memberBalances) {
        await tx.familyMember.updateMany({
          where: { familyId, userId },
          data: { balance },
        });
      }

      await tx.family.update({
        where: { id: familyId },
        data: { balance: computed.balance },
      });

      return computed;
    });
  }

  async readBalances(familyId: string): Promise<FamilyBalanceSnapshot> {
    const family = await this.prisma.db.family.findUnique({
      where: { id: familyId },
      select: {
        balance: true,
        members: { select: { userId: true, balance: true } },
      },
    });

    if (!family) {
      throw new DomainNotFoundException('Family not found');
    }

    return {
      familyId,
      balance: family.balance,
      memberBalances: new Map(
        family.members.map((member) => [member.userId, member.balance]),
      ),
    };
  }

  async computeBalances(familyId: string): Promise<FamilyBalanceSnapshot> {
    const tx = this.prisma.db;

    const [members, grouped] = await Promise.all([
      tx.familyMember.findMany({
        where: { familyId },
        select: { userId: true },
      }),
      tx.transaction.groupBy({
        by: ['userId', 'type'],
        where: {
          familyId,
          scope: TransactionScope.FAMILY,
          status: PrismaTransactionStatus.CONFIRMED,
        },
        _sum: { [TransactionAmountNormalizer.sumField]: true },
      }),
    ]);

    const memberBalances = new Map<string, Decimal>(
      members.map((member) => [member.userId, new Decimal(0)]),
    );
    let balance = new Decimal(0);

    for (const group of grouped) {
      const signed = TransactionAmountNormalizer.signedTotal(
        group.type as TransactionType,
        TransactionAmountNormalizer.normalizeSum(group._sum.value),
      );

      const current = memberBalances.get(group.userId) ?? new Decimal(0);
      memberBalances.set(group.userId, current.plus(signed));
      balance = balance.plus(signed);
    }

    return { familyId, balance, memberBalances };
  }

  async findAllIds(): Promise<string[]> {
    const families = await this.prisma.db.family.findMany({
      select: { id: true },
      orderBy: { createdAt: 'asc' },
    });

    return families.map((family) => family.id);
  }
}
