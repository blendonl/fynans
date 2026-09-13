import { Prisma } from 'prisma/generated/prisma/client';
import { ExpenseCategoryMapper } from '~feature/expense-category/core/infrastructure/mappers/expense-category.mapper';
import { StoreMapper } from '~feature/store/core/infrastructure/mappers/store.mapper';
import { TransactionMapper } from '~feature/transaction/core/infrastructure/mappers/transaction.mapper';
import { ExpenseItemMapper } from '~feature/expense-item/core/infrastructure/mappers/expense-item.mapper';
import { Expense } from '../../domain/entities/expense.entity';

export type PrismaExpenseWithRelations = Prisma.ExpenseGetPayload<{
  include: {
    category: true;
    store: true;
    receipt: true;
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
}>;

export class ExpenseMapper {
  static toDomain(prismaExpense: PrismaExpenseWithRelations): Expense {
    return new Expense({
      id: prismaExpense.id,
      transactionId: prismaExpense.transactionId,
      transaction: TransactionMapper.toDomain(prismaExpense.transaction),
      store: prismaExpense.store
        ? StoreMapper.toDomain(prismaExpense.store)
        : null,
      category: ExpenseCategoryMapper.toDomain(prismaExpense.category),
      storeId: prismaExpense.storeId,
      categoryId: prismaExpense.categoryId,
      description: prismaExpense.description,
      items: prismaExpense.items.map((item) =>
        ExpenseItemMapper.toDomain(item),
      ),
      receipt: prismaExpense.receipt
        ? {
            id: prismaExpense.receipt.id,
            storageKey: prismaExpense.receipt.storageKey,
          }
        : null,
      createdAt: prismaExpense.createdAt,
      updatedAt: prismaExpense.updatedAt,
    });
  }
}
