import { Transaction as PrismaTransaction } from 'prisma/generated/prisma/client';
import {
  Transaction,
  TransactionUser,
} from '../../domain/entities/transaction.entity';
import { TransactionType } from '../../domain/value-objects/transaction-type.vo';
import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';

interface PrismaTransactionWithUser extends PrismaTransaction {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    name: string;
    image: string | null;
  };
}

export class TransactionMapper {
  static toDomain(prismaTransaction: PrismaTransactionWithUser): Transaction {
    const user: TransactionUser = {
      id: prismaTransaction.user.id,
      firstName:
        prismaTransaction.user.firstName.length > 0
          ? prismaTransaction.user.firstName
          : prismaTransaction.user.name.split(' ')[0],
      lastName:
        prismaTransaction.user.lastName.length > 0
          ? prismaTransaction.user.lastName
          : prismaTransaction.user.name.split(' ')[0],
      image: prismaTransaction.user.image,
    };

    return new Transaction({
      id: prismaTransaction.id,
      userId: prismaTransaction.userId,
      type: prismaTransaction.type as TransactionType,
      value: prismaTransaction.value as Decimal,
      familyId: prismaTransaction.familyId ?? undefined,
      scope: prismaTransaction.scope as any,
      recordedAt: prismaTransaction.recordedAt,
      createdAt: prismaTransaction.createdAt,
      updatedAt: prismaTransaction.updatedAt,
      user,
    });
  }

  static toPersistence(transaction: Transaction) {
    return {
      id: transaction.id,
      userId: transaction.userId,
      type: transaction.type,
      value: transaction.value,
      familyId: transaction.familyId ?? null,
      scope: transaction.scope,
      recordedAt: transaction.recordedAt,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }
}
