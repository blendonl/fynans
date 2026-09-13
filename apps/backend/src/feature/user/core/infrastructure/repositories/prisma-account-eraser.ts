import { Injectable } from '@nestjs/common';
import { FamilyMemberRole } from 'prisma/generated/prisma/client';
import { PrismaService } from '~common/prisma/prisma.service';
import {
  AccountErasure,
  FamilyHandover,
  IAccountEraser,
} from '../../domain/repositories/account-eraser.interface';

const PROMOTION_ORDER: FamilyMemberRole[] = [
  FamilyMemberRole.ADMIN,
  FamilyMemberRole.MEMBER,
];

@Injectable()
export class PrismaAccountEraser implements IAccountEraser {
  constructor(private readonly prisma: PrismaService) {}

  async erase(userId: string): Promise<AccountErasure> {
    return this.prisma.runInTransaction(async () => {
      const transactionIds = await this.transactionIdsOf(userId);
      const storageKeys = await this.storageKeysOf(userId, transactionIds);
      const familyIds = await this.familyIdsOf(userId);

      const auditEntries = await this.eraseAuditTrail(userId, transactionIds);
      const receipts = await this.eraseReceipts(userId, transactionIds);

      await this.prisma.db.expense.deleteMany({
        where: { transactionId: { in: transactionIds } },
      });
      await this.prisma.db.income.deleteMany({
        where: { transactionId: { in: transactionIds } },
      });
      await this.prisma.db.transaction.deleteMany({ where: { userId } });

      await this.releaseSharedBaskets(userId, familyIds);

      await this.prisma.db.user.delete({ where: { id: userId } });

      const families: FamilyHandover[] = [];

      for (const familyId of familyIds) {
        families.push(await this.settleFamily(familyId));
      }

      return {
        transactions: transactionIds.length,
        receipts,
        auditEntries,
        storageKeys,
        families,
      };
    });
  }

  private async transactionIdsOf(userId: string): Promise<string[]> {
    const transactions = await this.prisma.db.transaction.findMany({
      where: { userId },
      select: { id: true },
    });

    return transactions.map((transaction) => transaction.id);
  }

  private async storageKeysOf(
    userId: string,
    transactionIds: string[],
  ): Promise<string[]> {
    const receipts = await this.prisma.db.receipt.findMany({
      where: this.receiptsOf(userId, transactionIds),
      select: { storageKey: true },
    });

    return Array.from(new Set(receipts.map((receipt) => receipt.storageKey)));
  }

  private async familyIdsOf(userId: string): Promise<string[]> {
    const memberships = await this.prisma.db.familyMember.findMany({
      where: { userId },
      select: { familyId: true },
    });

    return memberships.map((membership) => membership.familyId);
  }

  private async eraseAuditTrail(
    userId: string,
    transactionIds: string[],
  ): Promise<number> {
    const { count } = await this.prisma.db.financialAuditLog.deleteMany({
      where: {
        OR: [{ actorId: userId }, { transactionId: { in: transactionIds } }],
      },
    });

    return count;
  }

  private async eraseReceipts(
    userId: string,
    transactionIds: string[],
  ): Promise<number> {
    const { count } = await this.prisma.db.receipt.deleteMany({
      where: this.receiptsOf(userId, transactionIds),
    });

    return count;
  }

  private receiptsOf(userId: string, transactionIds: string[]) {
    return {
      OR: [{ userId }, { expense: { transactionId: { in: transactionIds } } }],
    };
  }

  private async releaseSharedBaskets(
    userId: string,
    familyIds: string[],
  ): Promise<void> {
    for (const familyId of familyIds) {
      const basket = await this.prisma.db.basket.findFirst({
        where: { familyId, userId },
        select: { id: true },
      });

      if (!basket) {
        continue;
      }

      const successor = await this.prisma.db.familyMember.findFirst({
        where: { familyId, userId: { not: userId } },
        orderBy: { joinedAt: 'asc' },
        select: { userId: true },
      });

      if (!successor) {
        continue;
      }

      await this.prisma.db.basket.update({
        where: { id: basket.id },
        data: { userId: successor.userId },
      });
    }
  }

  private async settleFamily(familyId: string): Promise<FamilyHandover> {
    const remaining = await this.prisma.db.familyMember.findMany({
      where: { familyId },
      orderBy: { joinedAt: 'asc' },
      select: { userId: true, role: true },
    });

    if (remaining.length === 0) {
      return this.retireEmptyFamily(familyId);
    }

    if (remaining.some((member) => member.role === FamilyMemberRole.OWNER)) {
      return { familyId, outcome: 'unchanged' };
    }

    const successor = PROMOTION_ORDER.flatMap((role) =>
      remaining.filter((member) => member.role === role),
    )[0];

    if (!successor) {
      return { familyId, outcome: 'unchanged' };
    }

    await this.prisma.db.familyMember.update({
      where: { familyId_userId: { familyId, userId: successor.userId } },
      data: { role: FamilyMemberRole.OWNER },
    });

    return {
      familyId,
      outcome: 'ownership-transferred',
      newOwnerId: successor.userId,
    };
  }

  private async retireEmptyFamily(familyId: string): Promise<FamilyHandover> {
    const transactions = await this.prisma.db.transaction.count({
      where: { familyId },
    });

    if (transactions > 0) {
      return { familyId, outcome: 'unchanged' };
    }

    await this.prisma.db.family.delete({ where: { id: familyId } });

    return { familyId, outcome: 'family-removed' };
  }
}
