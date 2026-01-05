import { Prisma } from 'prisma/generated/prisma/client';
import { Income } from '../../domain/entities/income.entity';
interface PrismaIncome extends Prisma.IncomeGetPayload<{
    include: {
        category: true;
        transaction: {
            include: {
                user: {
                    select: {
                        id: true;
                        firstName: true;
                        lastName: true;
                        name: true;
                    };
                };
            };
        };
    };
}> {
}
export declare class IncomeMapper {
    static toDomain(prismaIncome: PrismaIncome): Income;
    static toPersistence(income: Income): {
        id: string;
        transactionId: string;
        storeId: string;
        categoryId: string;
        createdAt: Date;
        updatedAt: Date;
    };
}
export {};
