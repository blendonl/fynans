import { Inject, Injectable } from '@nestjs/common';
import { OwnerScope } from '../../domain/owner-scope';
import {
  FAMILY_MEMBERSHIP_REPOSITORY,
  type IFamilyMembershipRepository,
} from '../../domain/repositories/family-membership.repository.interface';

@Injectable()
export class ResolveOwnerScopeUseCase {
  constructor(
    @Inject(FAMILY_MEMBERSHIP_REPOSITORY)
    private readonly familyMembershipRepository: IFamilyMembershipRepository,
  ) {}

  async execute(userId: string): Promise<OwnerScope> {
    const familyIds =
      await this.familyMembershipRepository.findFamilyIds(userId);

    return new OwnerScope(userId, familyIds);
  }
}
