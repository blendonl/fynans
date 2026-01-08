import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../common/prisma/prisma.service';
import { IFamilyInvitationRepository } from '../../domain/repositories/family-invitation.repository.interface';
import { FamilyInvitation } from '../../domain/entities/family-invitation.entity';
import { FamilyInvitationMapper } from '../mappers/family-invitation.mapper';

@Injectable()
export class PrismaFamilyInvitationRepository
  implements IFamilyInvitationRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Partial<FamilyInvitation>): Promise<FamilyInvitation> {
    const invitation = await this.prisma.familyInvitation.create({
      data: {
        familyId: data.familyId!,
        inviterId: data.inviterId!,
        inviteeEmail: data.inviteeEmail!,
        inviteeId: data.inviteeId ?? null,
        status: (data.status as any) || 'PENDING',
        expiresAt: data.expiresAt!,
      },
    });

    return FamilyInvitationMapper.toDomain(invitation);
  }

  async findById(id: string): Promise<FamilyInvitation | null> {
    const invitation = await this.prisma.familyInvitation.findUnique({
      where: { id },
    });

    return invitation ? FamilyInvitationMapper.toDomain(invitation) : null;
  }

  async findByFamilyId(familyId: string): Promise<FamilyInvitation[]> {
    const invitations = await this.prisma.familyInvitation.findMany({
      where: { familyId },
      orderBy: { createdAt: 'desc' },
    });

    return invitations.map((inv) => FamilyInvitationMapper.toDomain(inv));
  }

  async findByInviteeEmail(email: string): Promise<FamilyInvitation[]> {
    const invitations = await this.prisma.familyInvitation.findMany({
      where: {
        inviteeEmail: email,
        status: 'PENDING',
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return invitations.map((inv) => FamilyInvitationMapper.toDomain(inv));
  }

  async findByInviteeId(userId: string): Promise<FamilyInvitation[]> {
    const invitations = await this.prisma.familyInvitation.findMany({
      where: { inviteeId: userId },
      orderBy: { createdAt: 'desc' },
    });

    return invitations.map((inv) => FamilyInvitationMapper.toDomain(inv));
  }

  async findPendingByEmailAndFamily(email: string, familyId: string): Promise<FamilyInvitation | null> {
    const invitation = await this.prisma.familyInvitation.findFirst({
      where: {
        inviteeEmail: email,
        familyId: familyId,
        status: 'PENDING',
        expiresAt: { gt: new Date() },
      },
    });
    return invitation ? FamilyInvitationMapper.toDomain(invitation) : null;
  }

  async update(
    id: string,
    data: Partial<FamilyInvitation>,
  ): Promise<FamilyInvitation> {
    const updateData: any = {};

    if (data.status !== undefined) {
      updateData.status = data.status as any;
    }

    if (data.inviteeId !== undefined) {
      updateData.inviteeId = data.inviteeId;
    }

    const invitation = await this.prisma.familyInvitation.update({
      where: { id },
      data: updateData,
    });

    return FamilyInvitationMapper.toDomain(invitation);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.familyInvitation.delete({
      where: { id },
    });
  }
}
