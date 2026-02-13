import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { IFamilyInvitationRepository } from '../../domain/repositories/family-invitation.repository.interface';
import { IFamilyRepository } from '../../domain/repositories/family.repository.interface';
import { FamilyInvitation } from '../../domain/entities/family-invitation.entity';

@Injectable()
export class GetFamilyPendingInvitationsUseCase {
  constructor(
    @Inject('FamilyInvitationRepository')
    private readonly invitationRepository: IFamilyInvitationRepository,
    @Inject('FamilyRepository')
    private readonly familyRepository: IFamilyRepository,
  ) {}

  async execute(
    familyId: string,
    userId: string,
  ): Promise<FamilyInvitation[]> {
    const member = await this.familyRepository.findMember(familyId, userId);

    if (!member) {
      throw new ForbiddenException('You are not a member of this family');
    }

    return this.invitationRepository.findPendingByFamilyId(familyId);
  }
}
