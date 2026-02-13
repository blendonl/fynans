import { Prisma } from 'prisma/generated/prisma/client';
import { Expense } from '../../domain/entities/expense.entity';
import { TransactionMapper } from '~feature/transaction/core/infrastructure/mappers/transaction.mapper';
import { StoreMapper } from '~feature/store/core/infrastructure/mappers/store.mapper';
import { ExpenseCategoryMapper } from '~feature/expense-category/core/infrastructure/mappers/expense-category.mapper';
import { ExpenseItemMapper } from '~feature/expense-item/core/infrastructure/mappers/expense-item.mapper';

interface PrismaExpense extends Prisma.ExpenseGetPayload<{
  include: {
    category: true;
    store: true;
    transaction: {
      include: {
        user: true;
      };
    };
    items: {
      include: {
        item: {
          include: {
            item: {
              include: {
                category: true;
              };
            };
          };
        };
      };
    };
  };
}> {}

export class ExpenseMapper {
  static toDomain(prismaExpense: PrismaExpense): Expense {
    return new Expense({
      id: prismaExpense.id,
      transactionId: prismaExpense.transactionId,
      transaction: TransactionMapper.toDomain(prismaExpense.transaction),
      store: prismaExpense.store ? StoreMapper.toDomain(prismaExpense.store) : null,
      category: ExpenseCategoryMapper.toDomain(prismaExpense.category),
      storeId: prismaExpense.storeId,
      categoryId: prismaExpense.categoryId,
      items: prismaExpense.items.map(ExpenseItemMapper.toDomain),
      createdAt: prismaExpense.createdAt,
      updatedAt: prismaExpense.updatedAt,
    });
  }

  static toPersistence(expense: Expense) {
    return {
      id: expense.id,
      transactionId: expense.transactionId,
      storeId: expense.storeId,
      categoryId: expense.categoryId,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
    };
  }
}
