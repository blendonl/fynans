import { Injectable, Inject } from '@nestjs/common';
import { DomainForbiddenException } from '~common/exceptions/domain.exceptions';
import { IFamilyRepository } from '../../domain/repositories/family.repository.interface';

@Injectable()
export class VerifyFamilyMembershipUseCase {
  constructor(
    @Inject('FamilyRepository')
    private readonly familyRepository: IFamilyRepository,
  ) {}

  async execute(familyId: string, userId: string): Promise<void> {
    const member = await this.familyRepository.findMember(familyId, userId);
    if (!member) {
      throw new DomainForbiddenException('Not a member of this family');
    }
  }
}
