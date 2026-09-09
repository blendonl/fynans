import { Prisma } from 'prisma/generated/prisma/client';
import { ExpenseItem } from '../../domain/entities/expense-item.entity';

export type PrismaExpenseItemWithRelations = Prisma.ExpenseItemGetPayload<{
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
}>;

export class ExpenseItemMapper {
  static toDomain(
    prismaExpenseItem: PrismaExpenseItemWithRelations,
  ): ExpenseItem {
    return new ExpenseItem({
      id: prismaExpenseItem.id,
      itemId: prismaExpenseItem.itemId,
      itemName: prismaExpenseItem.item.item.name,
      expenseId: prismaExpenseItem.expenseId,
      categoryId: prismaExpenseItem.item.item.categoryId,
      price: prismaExpenseItem.price,
      discount: prismaExpenseItem.discount,
      quantity: prismaExpenseItem.quantity,
      createdAt: prismaExpenseItem.createdAt,
      updatedAt: prismaExpenseItem.updatedAt,
    });
  }
}
