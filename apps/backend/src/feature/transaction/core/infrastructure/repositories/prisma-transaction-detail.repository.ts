import { Injectable } from '@nestjs/common';
import { PrismaService } from '~common/prisma/prisma.service';
import {
  ITransactionDetailRepository,
  TransactionDetail,
} from '../../domain/repositories/transaction-detail.repository.interface';

@Injectable()
export class PrismaTransactionDetailRepository implements ITransactionDetailRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByTransactionIds(
    ids: string[],
  ): Promise<Map<string, TransactionDetail>> {
    if (ids.length === 0) {
      return new Map();
    }

    const transactions = await this.prisma.db.transaction.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        paymentMethod: { select: { name: true } },
        expense: {
          select: {
            description: true,
            category: { select: { name: true } },
            store: { select: { name: true } },
          },
        },
        income: {
          select: {
            description: true,
            category: { select: { name: true } },
          },
        },
      },
    });

    return new Map(
      transactions.map((transaction) => [
        transaction.id,
        {
          description:
            transaction.expense?.description ??
            transaction.income?.description ??
            null,
          categoryName:
            transaction.expense?.category.name ??
            transaction.income?.category.name ??
            null,
          storeName: transaction.expense?.store?.name ?? null,
          paymentMethodName: transaction.paymentMethod?.name ?? null,
        },
      ]),
    );
  }
}
