import { Inject, Injectable } from '@nestjs/common';
import { DomainNotFoundException } from '../../../exceptions/domain.exceptions';
import {
  OWNED_RESOURCE_LABELS,
  OwnedResource,
  ResourceOwner,
} from '../../domain/owned-resource';
import {
  FAMILY_MEMBERSHIP_REPOSITORY,
  type IFamilyMembershipRepository,
} from '../../domain/repositories/family-membership.repository.interface';
import {
  RESOURCE_OWNER_REPOSITORY,
  type IResourceOwnerRepository,
} from '../../domain/repositories/resource-owner.repository.interface';

@Injectable()
export class VerifyResourceAccessUseCase {
  constructor(
    @Inject(RESOURCE_OWNER_REPOSITORY)
    private readonly resourceOwnerRepository: IResourceOwnerRepository,
    @Inject(FAMILY_MEMBERSHIP_REPOSITORY)
    private readonly familyMembershipRepository: IFamilyMembershipRepository,
  ) {}

  async execute(
    resource: OwnedResource,
    resourceId: string,
    userId: string,
  ): Promise<void> {
    const owner = await this.resourceOwnerRepository.findOwner(
      resource,
      resourceId,
    );

    if (!owner || !(await this.isAccessible(owner, userId))) {
      throw new DomainNotFoundException(
        `${OWNED_RESOURCE_LABELS[resource]} not found`,
      );
    }
  }

  private async isAccessible(
    owner: ResourceOwner,
    userId: string,
  ): Promise<boolean> {
    if (owner.userId === userId) {
      return true;
    }

    if (!owner.familyId) {
      return false;
    }

    return this.familyMembershipRepository.isMember(owner.familyId, userId);
  }
}
