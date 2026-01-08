import { User } from '../../core/domain/entities/user.entity';

export class UserResponseDto {
  id!: string;
  email!: string;
  firstName!: string;
  lastName!: string;
  balance!: string;
  emailVerified!: boolean;
  createdAt!: string;
  updatedAt!: string;

  static fromEntity(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      balance: user.balance.toString(),
      emailVerified: user.emailVerified,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}

export class UserSearchResponseDto {
  id!: string;
  email!: string;
  firstName!: string;
  lastName!: string;

  static fromEntity(user: User): UserSearchResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }
}
