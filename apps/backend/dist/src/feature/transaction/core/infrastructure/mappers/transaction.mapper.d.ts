import { Transaction as PrismaTransaction } from 'prisma/generated/prisma/client';
import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionType } from '../../domain/value-objects/transaction-type.vo';
interface PrismaTransactionWithUser extends PrismaTransaction {
    user: {
        id: string;
        firstName: string;
        lastName: string;
        name: string;
    };
}
export declare class TransactionMapper {
    static toDomain(prismaTransaction: PrismaTransactionWithUser): Transaction;
    static toPersistence(transaction: Transaction): {
        id: string;
        userId: string;
        type: TransactionType;
        value: import("@prisma/client-runtime-utils").Decimal;
        familyId: string | null;
        scope: import("../../domain/entities/transaction.entity").TransactionScope;
        recordedAt: Date;
        createdAt: Date;
        updatedAt: Date;
    };
}
export {};
