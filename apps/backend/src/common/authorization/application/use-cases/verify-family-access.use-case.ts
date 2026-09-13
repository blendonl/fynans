import { Inject, Injectable } from '@nestjs/common';
import { DomainForbiddenException } from '../../../exceptions/domain.exceptions';
import { FamilyMemberRole } from '../../domain/family-role';
import {
  FAMILY_MEMBERSHIP_REPOSITORY,
  type IFamilyMembershipRepository,
} from '../../domain/repositories/family-membership.repository.interface';

@Injectable()
export class VerifyFamilyAccessUseCase {
  constructor(
    @Inject(FAMILY_MEMBERSHIP_REPOSITORY)
    private readonly familyMembershipRepository: IFamilyMembershipRepository,
  ) {}

  async execute(
    familyId: string,
    userId: string,
    requiredRoles?: FamilyMemberRole[],
  ): Promise<void> {
    const role = await this.familyMembershipRepository.findRole(
      familyId,
      userId,
    );

    if (!role) {
      throw new DomainForbiddenException('Not a member of this family');
    }

    if (requiredRoles?.length && !requiredRoles.includes(role)) {
      throw new DomainForbiddenException(
        `This action requires one of the following family roles: ${requiredRoles.join(', ')}`,
      );
    }
  }
}
