import { Injectable, Inject } from '@nestjs/common';
import { DomainNotFoundException } from '~common/exceptions/domain.exceptions';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { ChangePasswordResult } from '../../domain/services/password-changer.interface';
import { GetVisibleUserUseCase } from '../use-cases/get-visible-user.use-case';
import {
  UpdateProfileInput,
  UpdateProfileUseCase,
} from '../use-cases/update-profile.use-case';
import {
  ChangePasswordInput,
  ChangePasswordUseCase,
} from '../use-cases/change-password.use-case';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: IUserRepository,
    private readonly getVisibleUserUseCase: GetVisibleUserUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new DomainNotFoundException('User not found');
    return user;
  }

  async findVisibleTo(id: string, requesterId: string): Promise<User> {
    return this.getVisibleUserUseCase.execute(id, requesterId);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async updateProfile(id: string, input: UpdateProfileInput): Promise<User> {
    return this.updateProfileUseCase.execute(id, input);
  }

  async changePassword(
    input: ChangePasswordInput,
  ): Promise<ChangePasswordResult> {
    return this.changePasswordUseCase.execute(input);
  }

  async search(query: string, excludeFamilyId?: string, limit = 10): Promise<User[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }
    return this.userRepository.search(query.trim(), excludeFamilyId, limit);
  }
}
