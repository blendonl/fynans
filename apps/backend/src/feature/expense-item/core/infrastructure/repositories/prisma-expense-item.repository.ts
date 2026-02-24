import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../common/prisma/prisma.service';
import {
  IExpenseItemRepository,
  PaginatedResult,
  CreateExpenseItemData,
  UpdateExpenseItemData,
} from '../../domain/repositories/expense-item.repository.interface';
import { ExpenseItem } from '../../domain/entities/expense-item.entity';
import { Pagination } from '~common/dto/pagination.dto';
import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';

const EXPENSE_ITEM_INCLUDE = {
  item: { include: { item: { include: { category: true } } } },
  expense: true,
} as const;

@Injectable()
export class PrismaExpenseItemRepository implements IExpenseItemRepository {
  constructor(private readonly prisma: PrismaService) { }

  async create(data: CreateExpenseItemData): Promise<ExpenseItem> {
    const item = await this.prisma.expenseItem.create({
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
    const item = await this.prisma.expenseItem.findUnique({
      where: { id },
      include: EXPENSE_ITEM_INCLUDE,
    });

    return item ? ExpenseItem.fromPrisma(item) : null;
  }

  async findByExpenseId(expenseId: string): Promise<ExpenseItem[]> {
    const items = await this.prisma.expenseItem.findMany({
      where: { expenseId },
      include: EXPENSE_ITEM_INCLUDE,
      orderBy: { createdAt: 'asc' },
    });

    return items.map(ExpenseItem.fromPrisma);
  }

  async findAll(
    pagination?: Pagination,
  ): Promise<PaginatedResult<ExpenseItem>> {
    const [items, total] = await Promise.all([
      this.prisma.expenseItem.findMany({
        include: {
          item: { include: { item: { include: { category: true } } } },
          expense: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination?.skip,
        take: pagination?.take,
      }),
      this.prisma.expenseItem.count(),
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

    const item = await this.prisma.expenseItem.update({
      where: { id },
      data: updateData,
      include: EXPENSE_ITEM_INCLUDE,
    });

    return ExpenseItem.fromPrisma(item);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.expenseItem.delete({
      where: { id },
    });
  }

  async calculateExpenseTotal(expenseId: string): Promise<number> {
    const items = await this.prisma.expenseItem.findMany({
      where: { expenseId },
      select: {
        price: true,
        discount: true,
        quantity: true,
      },
    });

    const total = items.reduce((sum, item) => {
      const finalPrice = item.price.minus(item.discount).times(item.quantity);
      return sum + finalPrice.toNumber();
    }, 0);

    return total;
  }
}
