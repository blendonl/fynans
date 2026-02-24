import { IncomeCategory as PrismaIncomeCategory } from 'prisma/generated/prisma/client';
import { IncomeCategory } from '../../domain/entities/income-category.entity';

export class IncomeCategoryMapper {
  static toDomain(prismaCategory: PrismaIncomeCategory): IncomeCategory {
    return new IncomeCategory({
      id: prismaCategory.id,
      parentId: prismaCategory.parentId,
      name: prismaCategory.name,
      createdAt: prismaCategory.createdAt,
      updatedAt: prismaCategory.updatedAt,
    });
  }
}
