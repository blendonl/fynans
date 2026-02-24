import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../common/prisma/prisma.service';
import {
  IExpenseCategoryRepository,
  PaginatedResult,
  CreateExpenseCategoryData,
  UpdateExpenseCategoryData,
} from '../../domain/repositories/expense-category.repository.interface';
import { ExpenseCategory } from '../../domain/entities/expense-category.entity';
import { Pagination } from '~common/dto/pagination.dto';
import { getVisibleUserIds } from '../../../../../common/helpers/family-visibility.helper';

@Injectable()
export class PrismaExpenseCategoryRepository implements IExpenseCategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateExpenseCategoryData): Promise<ExpenseCategory> {
    const category = await this.prisma.expenseCategory.create({
      data: {
        name: data.name,
        parentId: data.parentId ?? null,
        isConnectedToStore: data.isConnectedToStore,
      },
    });

    return ExpenseCategory.fromPrisma(category);
  }

  async findById(id: string): Promise<ExpenseCategory | null> {
    const category = await this.prisma.expenseCategory.findUnique({
      where: { id },
    });

    return category ? ExpenseCategory.fromPrisma(category) : null;
  }

  async findByName(name: string): Promise<ExpenseCategory | null> {
    const category = await this.prisma.expenseCategory.findUnique({
      where: { name },
    });

    return category ? ExpenseCategory.fromPrisma(category) : null;
  }

  async findAll(
    userId: string,
    pagination?: Pagination,
    filters?: { search?: string },
  ): Promise<PaginatedResult<ExpenseCategory>> {
    const visibleUserIds = await getVisibleUserIds(this.prisma, userId);
    const where: any = {
      users: { some: { userId: { in: visibleUserIds } } },
    };

    if (filters?.search) {
      where.name = { contains: filters.search, mode: 'insensitive' };
    }

    const [categories, total] = await Promise.all([
      this.prisma.expenseCategory.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: pagination?.skip,
        take: pagination?.take,
      }),
      this.prisma.expenseCategory.count({ where }),
    ]);

    return {
      data: categories.map(ExpenseCategory.fromPrisma),
      total,
    };
  }

  async findByParentId(
    userId: string,
    parentId: string | null,
    pagination?: Pagination,
  ): Promise<PaginatedResult<ExpenseCategory>> {
    const visibleUserIds = await getVisibleUserIds(this.prisma, userId);
    const where = {
      parentId,
      users: { some: { userId: { in: visibleUserIds } } },
    };

    const [categories, total] = await Promise.all([
      this.prisma.expenseCategory.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: pagination?.skip,
        take: pagination?.take,
      }),
      this.prisma.expenseCategory.count({ where }),
    ]);

    return {
      data: categories.map(ExpenseCategory.fromPrisma),
      total,
    };
  }

  async findChildren(parentId: string): Promise<ExpenseCategory[]> {
    const categories = await this.prisma.expenseCategory.findMany({
      where: { parentId },
      orderBy: { name: 'asc' },
    });

    return categories.map(ExpenseCategory.fromPrisma);
  }

  async linkToUser(categoryId: string, userId: string): Promise<void> {
    await this.prisma.userExpenseCategory.upsert({
      where: { userId_categoryId: { userId, categoryId } },
      create: { userId, categoryId },
      update: {},
    });
  }

  async update(
    id: string,
    data: UpdateExpenseCategoryData,
  ): Promise<ExpenseCategory> {
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.parentId !== undefined) {
      updateData.parentId = data.parentId;
    }

    if (data.isConnectedToStore !== undefined) {
      updateData.isConnectedToStore = data.isConnectedToStore;
    }

    const category = await this.prisma.expenseCategory.update({
      where: { id },
      data: updateData,
    });

    return ExpenseCategory.fromPrisma(category);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.expenseCategory.delete({
      where: { id },
    });
  }

  async countExpensesByCategory(categoryId: string): Promise<number> {
    return this.prisma.expense.count({
      where: { categoryId },
    });
  }
}
