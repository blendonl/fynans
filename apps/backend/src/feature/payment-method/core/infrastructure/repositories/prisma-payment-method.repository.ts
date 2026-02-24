import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../common/prisma/prisma.service';
import {
  IPaymentMethodRepository,
  CreatePaymentMethodData,
  UpdatePaymentMethodData,
  BalanceSummaryItem,
} from '../../domain/repositories/payment-method.repository.interface';
import { PaymentMethod } from '../../domain/entities/payment-method.entity';
import { PaymentMethodMapper } from '../mappers/payment-method.mapper';
import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';
import {
  TransactionType as PrismaTransactionType,
  TransactionStatus as PrismaTransactionStatus,
} from 'prisma/generated/prisma/client';

@Injectable()
export class PrismaPaymentMethodRepository implements IPaymentMethodRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreatePaymentMethodData): Promise<PaymentMethod> {
    const paymentMethod = await this.prisma.paymentMethod.create({
      data: {
        id: data.id,
        userId: data.userId,
        name: data.name,
        type: data.type,
        color: data.color,
        initialBalance: data.initialBalance,
        currentBalance: data.currentBalance,
      },
    });

    return PaymentMethodMapper.toDomain(paymentMethod);
  }

  async findById(id: string): Promise<PaymentMethod | null> {
    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { id },
    });

    return paymentMethod ? PaymentMethodMapper.toDomain(paymentMethod) : null;
  }

  async findByUserIdAndName(
    userId: string,
    name: string,
  ): Promise<PaymentMethod | null> {
    const paymentMethod = await this.prisma.paymentMethod.findFirst({
      where: { userId, name },
    });

    return paymentMethod ? PaymentMethodMapper.toDomain(paymentMethod) : null;
  }

  async findAllByUserId(userId: string): Promise<PaymentMethod[]> {
    const paymentMethods = await this.prisma.paymentMethod.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });

    return paymentMethods.map(PaymentMethodMapper.toDomain);
  }

  async update(
    id: string,
    data: UpdatePaymentMethodData,
  ): Promise<PaymentMethod> {
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.type !== undefined) {
      updateData.type = data.type;
    }

    if (data.color !== undefined) {
      updateData.color = data.color;
    }

    if (data.initialBalance !== undefined) {
      updateData.initialBalance = data.initialBalance;
    }

    if (data.currentBalance !== undefined) {
      updateData.currentBalance = data.currentBalance;
    }

    const paymentMethod = await this.prisma.paymentMethod.update({
      where: { id },
      data: updateData,
    });

    return PaymentMethodMapper.toDomain(paymentMethod);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.paymentMethod.delete({
      where: { id },
    });
  }

  async recalculateBalance(id: string): Promise<PaymentMethod> {
    const updated = await this.prisma.$transaction(async (tx) => {
      const paymentMethod = await tx.paymentMethod.findUnique({
        where: { id },
      });

      if (!paymentMethod) {
        throw new Error('Payment method not found');
      }

      const groupResult = await tx.transaction.groupBy({
        by: ['type'],
        where: { paymentMethodId: id, status: PrismaTransactionStatus.CONFIRMED },
        _sum: { value: true },
      });

      let totalIncome = new Decimal(0);
      let totalExpense = new Decimal(0);

      for (const group of groupResult) {
        if (group.type === PrismaTransactionType.INCOME) {
          totalIncome = group._sum.value ?? new Decimal(0);
        } else if (group.type === PrismaTransactionType.EXPENSE) {
          totalExpense = group._sum.value ?? new Decimal(0);
        }
      }

      const currentBalance = paymentMethod.initialBalance
        .add(totalIncome)
        .sub(totalExpense);

      return tx.paymentMethod.update({
        where: { id },
        data: { currentBalance },
      });
    });

    return PaymentMethodMapper.toDomain(updated);
  }

  async getBalanceSummary(userId: string): Promise<BalanceSummaryItem[]> {
    const paymentMethods = await this.prisma.paymentMethod.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        color: true,
        currentBalance: true,
      },
    });

    return paymentMethods.map((pm) => ({
      id: pm.id,
      name: pm.name,
      color: pm.color,
      currentBalance: pm.currentBalance,
    }));
  }
}
