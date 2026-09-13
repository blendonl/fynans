import { Injectable } from '@nestjs/common';
import { Prisma } from 'prisma/generated/prisma/client';
import { PrismaService } from '../../../../../common/prisma/prisma.service';
import {
  IUserRepository,
  UserProfileChanges,
} from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? UserMapper.toDomain(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? UserMapper.toDomain(user) : null;
  }

  async update(id: string, changes: UserProfileChanges): Promise<User> {
    const data: Prisma.UserUpdateInput = {};

    if (changes.firstName !== undefined) {
      data.firstName = changes.firstName;
    }

    if (changes.lastName !== undefined) {
      data.lastName = changes.lastName;
    }

    if (changes.image !== undefined) {
      data.image = changes.image;
    }

    if (changes.email !== undefined) {
      data.email = changes.email;
    }

    if (changes.emailVerified !== undefined) {
      data.emailVerified = changes.emailVerified;
    }

    if (changes.firstName !== undefined || changes.lastName !== undefined) {
      const current = await this.prisma.user.findUniqueOrThrow({
        where: { id },
        select: { firstName: true, lastName: true },
      });

      data.name = [
        changes.firstName ?? current.firstName,
        changes.lastName ?? current.lastName,
      ]
        .map((part) => part.trim())
        .filter(Boolean)
        .join(' ');
    }

    const user = await this.prisma.user.update({ where: { id }, data });

    return UserMapper.toDomain(user);
  }

  async search(query: string, excludeFamilyId?: string, limit = 10): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { email: { contains: query, mode: 'insensitive' } },
              { firstName: { contains: query, mode: 'insensitive' } },
              { lastName: { contains: query, mode: 'insensitive' } },
            ],
          },
          excludeFamilyId
            ? {
                familyMemberships: {
                  none: { familyId: excludeFamilyId },
                },
              }
            : {},
        ],
      },
      take: limit,
    });
    return users.map(UserMapper.toDomain);
  }
}
