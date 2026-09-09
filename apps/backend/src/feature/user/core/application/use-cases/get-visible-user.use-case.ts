import { Inject, Injectable } from '@nestjs/common';
import { DomainNotFoundException } from '~common/exceptions/domain.exceptions';
import {
  FAMILY_MEMBERSHIP_REPOSITORY,
  type IFamilyMembershipRepository,
} from '~common/authorization/domain/repositories/family-membership.repository.interface';
import { type IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class GetVisibleUserUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: IUserRepository,
    @Inject(FAMILY_MEMBERSHIP_REPOSITORY)
    private readonly familyMembershipRepository: IFamilyMembershipRepository,
  ) {}

  async execute(userId: string, requesterId: string): Promise<User> {
    if (!(await this.isVisible(userId, requesterId))) {
      throw new DomainNotFoundException('User not found');
    }

    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new DomainNotFoundException('User not found');
    }

    return user;
  }

  private async isVisible(
    userId: string,
    requesterId: string,
  ): Promise<boolean> {
    if (userId === requesterId) {
      return true;
    }

    const coMemberIds =
      await this.familyMembershipRepository.findCoMemberUserIds(requesterId);

    return coMemberIds.includes(userId);
  }
}
