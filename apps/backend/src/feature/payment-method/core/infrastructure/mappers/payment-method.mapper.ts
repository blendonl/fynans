import { PaymentMethod as PrismaPaymentMethod } from 'prisma/generated/prisma/client';
import { PaymentMethod } from '../../domain/entities/payment-method.entity';
import { PaymentMethodType } from '../../domain/value-objects/payment-method-type.enum';

export class PaymentMethodMapper {
  static toDomain(prismaPaymentMethod: PrismaPaymentMethod): PaymentMethod {
    return new PaymentMethod({
      id: prismaPaymentMethod.id,
      userId: prismaPaymentMethod.userId,
      name: prismaPaymentMethod.name,
      type: prismaPaymentMethod.type as PaymentMethodType,
      color: prismaPaymentMethod.color,
      initialBalance: prismaPaymentMethod.initialBalance,
      currentBalance: prismaPaymentMethod.currentBalance,
      createdAt: prismaPaymentMethod.createdAt,
      updatedAt: prismaPaymentMethod.updatedAt,
    });
  }
}
