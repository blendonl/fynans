import {
  ExpenseItem as PrismaExpenseItem,
  StoreItem as PrismaStoreItem,
  StoreItemCategory as PrismaStoreItemCategory,
} from 'prisma/generated/prisma/client';
import { ExpenseItem } from '../../domain/entities/expense-item.entity';

export class ExpenseItemMapper {
  static toDomain(
    prismaExpenseItem: PrismaExpenseItem & {
      item: PrismaStoreItem & {
        category: PrismaStoreItemCategory;
      };
    },
  ): ExpenseItem {
    return new ExpenseItem({
      id: prismaExpenseItem.id,
      itemId: prismaExpenseItem.itemId,
      expenseId: prismaExpenseItem.expenseId,
      categoryId: prismaExpenseItem.item.categoryId,
      price: prismaExpenseItem.price,
      discount: prismaExpenseItem.discount,
      createdAt: prismaExpenseItem.createdAt,
      updatedAt: prismaExpenseItem.updatedAt,
    });
  }

  static toPersistence(expenseItem: ExpenseItem) {
    return {
      id: expenseItem.id,
      itemId: expenseItem.itemId,
      expenseId: expenseItem.expenseId,
      categoryId: expenseItem.categoryId,
      price: expenseItem.price,
      discount: expenseItem.discount,
      createdAt: expenseItem.createdAt,
      updatedAt: expenseItem.updatedAt,
    };
  }
}
