import { Injectable, Inject, ForbiddenException, ConflictException } from '@nestjs/common';
import { IFamilyRepository } from '../../domain/repositories/family.repository.interface';
import { IFamilyInvitationRepository } from '../../domain/repositories/family-invitation.repository.interface';
import { InviteMemberDto } from '../dto/invite-member.dto';
import {
  FamilyInvitation,
  FamilyInvitationStatus,
} from '../../domain/entities/family-invitation.entity';
import { CreateNotificationUseCase } from '../../../../notification/core/application/use-cases/create-notification.use-case';
import {
  NotificationType,
  DeliveryMethod,
  NotificationPriority,
} from '../../../../notification/core/domain/value-objects/notification-type.vo';
import { v4 as uuid } from 'uuid';
import { UserService } from '~feature/user/core/application/services/user.service';

@Injectable()
export class InviteMemberUseCase {
  constructor(
    @Inject('FamilyRepository')
    private readonly familyRepository: IFamilyRepository,
    @Inject('FamilyInvitationRepository')
    private readonly invitationRepository: IFamilyInvitationRepository,
    private readonly createNotificationUseCase: CreateNotificationUseCase,
    private readonly userService: UserService,
  ) {}

  async execute(
    dto: InviteMemberDto,
    inviterId: string,
  ): Promise<FamilyInvitation> {
    const member = await this.familyRepository.findMember(
      dto.familyId,
      inviterId,
    );
    if (!member) {
      throw new ForbiddenException('Not a family member');
    }
    if (!member.canManageMembers()) {
      throw new ForbiddenException('No permission to invite members');
    }

    const inviteeUser = await this.userService.findByEmail(dto.inviteeEmail);
    if (inviteeUser) {
      const existingMember = await this.familyRepository.findMember(
        dto.familyId,
        inviteeUser.id,
      );
      if (existingMember) {
        throw new ConflictException('User is already a member of this family');
      }
    }

    const pendingInvitation = await this.invitationRepository.findPendingByEmailAndFamily(
      dto.inviteeEmail,
      dto.familyId,
    );
    if (pendingInvitation) {
      throw new ConflictException('A pending invitation already exists for this email');
    }

    // Create invitation (expires in 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await this.invitationRepository.create({
      id: uuid(),
      familyId: dto.familyId,
      inviterId: inviterId,
      inviteeEmail: dto.inviteeEmail,
      status: FamilyInvitationStatus.PENDING,
      expiresAt: expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Get family and inviter details for notification
    const family = await this.familyRepository.findById(dto.familyId);

    // Emit notification to inviter (invitation sent)
    await this.createNotificationUseCase.execute({
      userId: inviterId,
      type: NotificationType.FAMILY_INVITATION_SENT,
      data: {
        invitationId: invitation.id,
        familyId: dto.familyId,
        inviteeEmail: dto.inviteeEmail,
        familyName: family?.name,
      },
      deliveryMethods: [DeliveryMethod.IN_APP],
      priority: NotificationPriority.LOW,
      familyId: dto.familyId,
      invitationId: invitation.id,
    });

    if (inviteeUser && inviteeUser.emailVerified) {
      const inviter = await this.userService.findById(inviterId);
      await this.createNotificationUseCase.execute({
        userId: inviteeUser.id,
        type: NotificationType.FAMILY_INVITATION_RECEIVED,
        data: {
          invitationId: invitation.id,
          familyId: dto.familyId,
          familyName: family?.name,
          inviterName: inviter?.fullName,
        },
        deliveryMethods: [DeliveryMethod.IN_APP, DeliveryMethod.PUSH],
        priority: NotificationPriority.MEDIUM,
        familyId: dto.familyId,
        invitationId: invitation.id,
      });
    }

    return invitation;
  }
}
