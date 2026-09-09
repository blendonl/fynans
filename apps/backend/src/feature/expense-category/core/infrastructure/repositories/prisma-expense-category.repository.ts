import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../common/prisma/prisma.service';
import {
  IExpenseCategoryRepository,
  PaginatedResult,
  CreateExpenseCategoryData,
  UpdateExpenseCategoryData,
} from '../../domain/repositories/expense-category.repository.interface';
import { ExpenseCategory } from '../../domain/entities/expense-category.entity';
import { Pagination } from '~common/dto/pagination.dto';
import {
  FAMILY_MEMBERSHIP_REPOSITORY,
  type IFamilyMembershipRepository,
} from '~common/authorization/domain/repositories/family-membership.repository.interface';

@Injectable()
export class PrismaExpenseCategoryRepository implements IExpenseCategoryRepository {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(FAMILY_MEMBERSHIP_REPOSITORY)
    private readonly familyMembershipRepository: IFamilyMembershipRepository,
  ) {}

  async create(data: CreateExpenseCategoryData): Promise<ExpenseCategory> {
    const category = await this.prisma.expenseCategory.create({
      data: {
        userId: data.userId,
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

  async findVisibleById(
    id: string,
    userId: string,
  ): Promise<ExpenseCategory | null> {
    const visibleUserIds =
      await this.familyMembershipRepository.findCoMemberUserIds(userId);
    const category = await this.prisma.expenseCategory.findFirst({
      where: { id, userId: { in: visibleUserIds } },
    });

    return category ? ExpenseCategory.fromPrisma(category) : null;
  }

  async findOwnedByName(
    name: string,
    userId: string,
  ): Promise<ExpenseCategory | null> {
    const category = await this.prisma.expenseCategory.findUnique({
      where: { userId_name: { userId, name } },
    });

    return category ? ExpenseCategory.fromPrisma(category) : null;
  }

  async findAll(
    userId: string,
    pagination?: Pagination,
    filters?: { search?: string },
  ): Promise<PaginatedResult<ExpenseCategory>> {
    const visibleUserIds =
      await this.familyMembershipRepository.findCoMemberUserIds(userId);
    const where: any = {
      userId: { in: visibleUserIds },
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
    const visibleUserIds =
      await this.familyMembershipRepository.findCoMemberUserIds(userId);
    const where = {
      parentId,
      userId: { in: visibleUserIds },
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

  async findChildren(
    parentId: string,
    userId: string,
  ): Promise<ExpenseCategory[]> {
    const visibleUserIds =
      await this.familyMembershipRepository.findCoMemberUserIds(userId);
    const categories = await this.prisma.expenseCategory.findMany({
      where: { parentId, userId: { in: visibleUserIds } },
      orderBy: { name: 'asc' },
    });

    return categories.map(ExpenseCategory.fromPrisma);
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

  async countExpensesInOwnedCategory(
    categoryId: string,
    userId: string,
  ): Promise<number> {
    return this.prisma.expense.count({
      where: { categoryId, category: { userId } },
    });
  }
}
