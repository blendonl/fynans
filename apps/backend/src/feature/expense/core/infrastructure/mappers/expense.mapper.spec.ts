import { ExpenseMapper } from './expense.mapper';
// Mock Decimal
class Decimal {
    constructor(private readonly value: number | string) { }
    toNumber() { return Number(this.value); }
    minus(d: Decimal) { return new Decimal(Number(this.value) - Number(d.value)); }
}

describe('ExpenseMapper', () => {
    it('should map prisma expense with items to domain expense', () => {
        const date = new Date();
        const prismaExpense = {
            id: 'expense-1',
            transactionId: 'tx-1',
            storeId: 'store-1',
            categoryId: 'cat-1',
            createdAt: date,
            updatedAt: date,
            transaction: {
                id: 'tx-1',
                userId: 'user-1',
                type: 'EXPENSE',
                value: new Decimal(100),
                familyId: null,
                scope: 'PERSONAL',
                recordedAt: date,
                createdAt: date,
                updatedAt: date,
                user: {
                    id: 'user-1',
                    firstName: 'John',
                    lastName: 'Doe',
                    name: 'John Doe',
                    image: null,
                },
            },
            category: {
                id: 'cat-1',
                name: 'Groceries',
                userId: 'user-1',
                createdAt: date,
                updatedAt: date,
            },
            store: {
                id: 'store-1',
                name: 'Supermarket',
                location: 'Downtown',
                createdAt: date,
                updatedAt: date,
            },
            items: [
                {
                    id: 'expense-item-1',
                    itemId: 'store-item-1',
                    expenseId: 'expense-1',
                    price: new Decimal(50),
                    discount: new Decimal(0),
                    quantity: new Decimal(1),
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
                            name: 'Milk',
                            categoryId: 'item-cat-1',
                            createdAt: date,
                            updatedAt: date,
                            category: {
                                id: 'item-cat-1',
                                name: 'Dairy',
                                userId: 'user-1',
                                parentId: null,
                                createdAt: date,
                                updatedAt: date,
                            },
                        },
                    },
                },
            ],
        };

        // @ts-ignore - ignoring type mismatch for deep prisma types which are hard to mock perfectly
        const domainExpense = ExpenseMapper.toDomain(prismaExpense);

        expect(domainExpense.items).toHaveLength(1);
        expect(domainExpense.items[0].id).toBe('expense-item-1');
        expect(domainExpense.items[0].itemName).toBe('Milk');
        expect(domainExpense.items[0].price.toNumber()).toBe(50);
    });
});
