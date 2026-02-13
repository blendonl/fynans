import { FamilyInvitation } from '../entities/family-invitation.entity';

export interface IFamilyInvitationRepository {
  create(data: Partial<FamilyInvitation>): Promise<FamilyInvitation>;
  findById(id: string): Promise<FamilyInvitation | null>;
  findByFamilyId(familyId: string): Promise<FamilyInvitation[]>;
  findByInviteeEmail(email: string): Promise<FamilyInvitation[]>;
  findByInviteeId(userId: string): Promise<FamilyInvitation[]>;
  findPendingByEmailAndFamily(email: string, familyId: string): Promise<FamilyInvitation | null>;
  findPendingByFamilyId(familyId: string): Promise<FamilyInvitation[]>;
  update(
    id: string,
    data: Partial<FamilyInvitation>,
  ): Promise<FamilyInvitation>;
  delete(id: string): Promise<void>;
}
