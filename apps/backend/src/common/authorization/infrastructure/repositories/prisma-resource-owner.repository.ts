import { Injectable } from '@nestjs/common';
import { TransactionScope } from 'prisma/generated/prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { OwnedResource, ResourceOwner } from '../../domain/owned-resource';
import { IResourceOwnerRepository } from '../../domain/repositories/resource-owner.repository.interface';

const TRANSACTION_OWNERSHIP_SELECT = {
  userId: true,
  familyId: true,
  scope: true,
} as const;

interface TransactionOwnership {
  userId: string;
  familyId: string | null;
  scope: TransactionScope;
}

@Injectable()
export class PrismaResourceOwnerRepository implements IResourceOwnerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOwner(
    resource: OwnedResource,
    resourceId: string,
  ): Promise<ResourceOwner | null> {
    switch (resource) {
      case 'expense':
        return this.findExpenseOwner(resourceId);
      case 'expenseItem':
        return this.findExpenseItemOwner(resourceId);
    }
  }

  private async findExpenseOwner(
    expenseId: string,
  ): Promise<ResourceOwner | null> {
    const expense = await this.prisma.expense.findUnique({
      where: { id: expenseId },
      select: { transaction: { select: TRANSACTION_OWNERSHIP_SELECT } },
    });

    return expense ? this.toResourceOwner(expense.transaction) : null;
  }

  private async findExpenseItemOwner(
    expenseItemId: string,
  ): Promise<ResourceOwner | null> {
    const expenseItem = await this.prisma.expenseItem.findUnique({
      where: { id: expenseItemId },
      select: {
        expense: {
          select: { transaction: { select: TRANSACTION_OWNERSHIP_SELECT } },
        },
      },
    });

    return expenseItem
      ? this.toResourceOwner(expenseItem.expense.transaction)
      : null;
  }

  private toResourceOwner(transaction: TransactionOwnership): ResourceOwner {
    const sharedFamilyId =
      transaction.scope === TransactionScope.FAMILY
        ? transaction.familyId
        : null;

    return { userId: transaction.userId, familyId: sharedFamilyId };
  }
}
