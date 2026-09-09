import { Injectable, Inject } from '@nestjs/common';
import { IFamilyInvitationRepository } from '../../domain/repositories/family-invitation.repository.interface';
import { FamilyInvitation } from '../../domain/entities/family-invitation.entity';

@Injectable()
export class GetFamilyPendingInvitationsUseCase {
  constructor(
    @Inject('FamilyInvitationRepository')
    private readonly invitationRepository: IFamilyInvitationRepository,
  ) {}

  async execute(familyId: string): Promise<FamilyInvitation[]> {
    return this.invitationRepository.findPendingByFamilyId(familyId);
  }
}
