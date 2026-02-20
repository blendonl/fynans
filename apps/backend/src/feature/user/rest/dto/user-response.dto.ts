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
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.firstName = user.firstName;
    dto.lastName = user.lastName;
    dto.balance = user.balance.toString();
    dto.emailVerified = user.emailVerified;
    dto.createdAt = user.createdAt.toISOString();
    dto.updatedAt = user.updatedAt.toISOString();
    return dto;
  }
}

export class UserSearchResponseDto {
  id!: string;
  email!: string;
  firstName!: string;
  lastName!: string;

  static fromEntity(user: User): UserSearchResponseDto {
    const dto = new UserSearchResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.firstName = user.firstName;
    dto.lastName = user.lastName;
    return dto;
  }
}
