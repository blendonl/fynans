import { Family } from '../../domain/entities/family.entity';
import { Family as PrismaFamily } from 'prisma/generated/prisma/client';

export class FamilyMapper {
  static toDomain(prismaFamily: PrismaFamily): Family {
    return new Family({
      id: prismaFamily.id,
      name: prismaFamily.name,
      balance: prismaFamily.balance.toNumber(),
      createdAt: prismaFamily.createdAt,
      updatedAt: prismaFamily.updatedAt,
    });
  }
}
