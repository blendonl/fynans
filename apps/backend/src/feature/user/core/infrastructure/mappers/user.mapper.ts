import { User as PrismaUser } from 'prisma/generated/prisma/client';
import { User } from '../../domain/entities/user.entity';

export class UserMapper {
  static toDomain(prismaUser: PrismaUser): User {
    let { firstName, lastName } = prismaUser;
    const name = prismaUser.name?.trim();

    if (!firstName?.trim() && !lastName?.trim() && name) {
      const nameParts = name.split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }

    return new User({
      id: prismaUser.id,
      email: prismaUser.email,
      firstName,
      lastName,
      balance: Number(prismaUser.balance),
      emailVerified: prismaUser.emailVerified,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });
  }
}
