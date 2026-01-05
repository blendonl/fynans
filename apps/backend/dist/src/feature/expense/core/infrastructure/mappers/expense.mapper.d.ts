import { Prisma } from 'prisma/generated/prisma/client';
import { Expense } from '../../domain/entities/expense.entity';
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
}> {
}
export declare class ExpenseMapper {
    static toDomain(prismaExpense: PrismaExpense): Expense;
    static toPersistence(expense: Expense): {
        id: string;
        transactionId: string;
        storeId: string;
        categoryId: string;
        createdAt: Date;
        updatedAt: Date;
    };
}
export {};
