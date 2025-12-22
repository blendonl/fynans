import { Income as PrismaIncome } from 'prisma/generated/prisma/client';
import { Income } from '../../domain/entities/income.entity';
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
