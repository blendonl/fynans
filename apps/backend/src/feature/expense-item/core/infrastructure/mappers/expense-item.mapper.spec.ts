import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';
import { ExpenseItemMapper } from './expense-item.mapper';

describe('ExpenseItemMapper.toDomain', () => {
  const date = new Date('2026-01-15T10:00:00.000Z');

  const prismaExpenseItem = {
    id: 'expense-item-1',
    itemId: 'store-item-1',
    expenseId: 'expense-1',
    price: new Decimal(50),
    discount: new Decimal(5),
    quantity: new Decimal(2),
    createdAt: date,
    updatedAt: date,
    item: {
      id: 'store-item-1',
      itemId: 'item-1',
      storeId: 'store-1',
      price: new Decimal(50),
      createdAt: date,
      updatedAt: date,
      item: {
        id: 'item-1',
        name: 'Qumësht',
        categoryId: 'item-cat-1',
        createdAt: date,
        updatedAt: date,
        category: {
          id: 'item-cat-1',
          name: 'Bulmet',
          parentId: null,
          createdAt: date,
          updatedAt: date,
        },
      },
    },
  };

  it('flattens the nested item relation onto the domain entity', () => {
    const item = ExpenseItemMapper.toDomain(prismaExpenseItem as never);

    expect(item.id).toBe('expense-item-1');
    expect(item.itemName).toBe('Qumësht');
    expect(item.categoryId).toBe('item-cat-1');
    expect(item.expenseId).toBe('expense-1');
  });

  it('preserves Decimal precision for money fields', () => {
    const item = ExpenseItemMapper.toDomain(prismaExpenseItem as never);

    expect(item.price.toNumber()).toBe(50);
    expect(item.discount.toNumber()).toBe(5);
    expect(item.quantity.toNumber()).toBe(2);
    expect(item.getFinalPrice().toNumber()).toBe(90);
  });
});
