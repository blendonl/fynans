import { Prisma } from 'prisma/generated/prisma/client';
import { Income } from '../../domain/entities/income.entity';
import { TransactionMapper } from '~feature/transaction/core/infrastructure/mappers/transaction.mapper';
import { IncomeCategoryMapper } from '~feature/income-category/core/infrastructure/mappers/income-category.mapper';

interface PrismaIncome extends Prisma.IncomeGetPayload<{
  include: {
    category: true;
    transaction: {
      include: {
        user: {
          select: {
            id: true;
            name: true;
            firstName: true;
            lastName: true;
            image: true;
          };
        };
      };
    };
  };
}> {}

export class IncomeMapper {
  static toDomain(prismaIncome: PrismaIncome): Income {
    return new Income({
      id: prismaIncome.id,
      transactionId: prismaIncome.transactionId,
      storeId: prismaIncome.storeId,
      categoryId: prismaIncome.categoryId,
      transaction: prismaIncome.transaction
        ? TransactionMapper.toDomain(prismaIncome.transaction)
        : undefined,
      category: prismaIncome.category
        ? IncomeCategoryMapper.toDomain(prismaIncome.category)
        : undefined,
      createdAt: prismaIncome.createdAt,
      updatedAt: prismaIncome.updatedAt,
    });
  }

  static toPersistence(income: Income) {
    return {
      id: income.id,
      transactionId: income.transactionId,
      storeId: income.storeId,
      categoryId: income.categoryId,
      createdAt: income.createdAt,
      updatedAt: income.updatedAt,
    };
  }
}
