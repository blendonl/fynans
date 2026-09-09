import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../common/prisma/prisma.service';
import {
  IExpenseItemRepository,
  PaginatedResult,
  CreateExpenseItemData,
  UpdateExpenseItemData,
  ExpenseTransactionRef,
} from '../../domain/repositories/expense-item.repository.interface';
import { ExpenseItem } from '../../domain/entities/expense-item.entity';
import { Pagination } from '~common/dto/pagination.dto';
import { OwnerScope } from '~common/authorization/domain/owner-scope';
import { Prisma, TransactionScope } from 'prisma/generated/prisma/client';
import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';
import { ExpenseTotalCalculator } from '../../domain/services/expense-total.calculator';

const EXPENSE_ITEM_INCLUDE = {
  item: { include: { item: { include: { category: true } } } },
  expense: true,
} as const;

@Injectable()
export class PrismaExpenseItemRepository implements IExpenseItemRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateExpenseItemData): Promise<ExpenseItem> {
    const item = await this.prisma.db.expenseItem.create({
      data: {
        itemId: data.itemId,
        expenseId: data.expenseId,
        price: new Decimal(data.price.toString()),
        discount: new Decimal(data.discount.toString()),
        quantity: data.quantity,
      },
      include: EXPENSE_ITEM_INCLUDE,
    });

    return ExpenseItem.fromPrisma(item);
  }

  async findById(id: string): Promise<ExpenseItem | null> {
    const item = await this.prisma.db.expenseItem.findUnique({
      where: { id },
      include: EXPENSE_ITEM_INCLUDE,
    });

    return item ? ExpenseItem.fromPrisma(item) : null;
  }

  async findByExpenseId(
    expenseId: string,
    scope: OwnerScope,
  ): Promise<ExpenseItem[]> {
    const items = await this.prisma.db.expenseItem.findMany({
      where: { expenseId, ...this.accessibleTo(scope) },
      include: EXPENSE_ITEM_INCLUDE,
      orderBy: { createdAt: 'asc' },
    });

    return items.map(ExpenseItem.fromPrisma);
  }

  async findAll(
    scope: OwnerScope,
    pagination?: Pagination,
  ): Promise<PaginatedResult<ExpenseItem>> {
    const where = this.accessibleTo(scope);

    const [items, total] = await Promise.all([
      this.prisma.db.expenseItem.findMany({
        where,
        include: EXPENSE_ITEM_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: pagination?.skip,
        take: pagination?.take,
      }),
      this.prisma.db.expenseItem.count({ where }),
    ]);

    return {
      data: items.map(ExpenseItem.fromPrisma),
      total,
    };
  }

  async update(id: string, data: UpdateExpenseItemData): Promise<ExpenseItem> {
    const updateData: Record<string, unknown> = {};

    if (data.categoryId !== undefined) {
      updateData.categoryId = data.categoryId;
    }

    if (data.price !== undefined) {
      updateData.price = new Decimal(data.price.toString());
    }

    if (data.discount !== undefined) {
      updateData.discount = new Decimal(data.discount.toString());
    }

    const item = await this.prisma.db.expenseItem.update({
      where: { id },
      data: updateData,
      include: EXPENSE_ITEM_INCLUDE,
    });

    return ExpenseItem.fromPrisma(item);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.db.expenseItem.delete({
      where: { id },
    });
  }

  async calculateExpenseTotal(expenseId: string): Promise<Decimal> {
    const items = await this.prisma.db.expenseItem.findMany({
      where: { expenseId },
      select: {
        price: true,
        discount: true,
        quantity: true,
      },
    });

    return ExpenseTotalCalculator.total(items);
  }

  async findExpenseTransaction(
    expenseId: string,
  ): Promise<ExpenseTransactionRef | null> {
    const expense = await this.prisma.db.expense.findUnique({
      where: { id: expenseId },
      select: {
        transaction: {
          select: {
            id: true,
            value: true,
            familyId: true,
            paymentMethodId: true,
          },
        },
      },
    });

    return expense?.transaction ?? null;
  }

  private accessibleTo(scope: OwnerScope): Prisma.ExpenseItemWhereInput {
    const transaction: Prisma.TransactionWhereInput = scope.hasFamilies
      ? {
          OR: [
            { userId: scope.userId },
            {
              familyId: { in: scope.familyIds },
              scope: TransactionScope.FAMILY,
            },
          ],
        }
      : { userId: scope.userId };

    return { expense: { transaction } };
  }
}
