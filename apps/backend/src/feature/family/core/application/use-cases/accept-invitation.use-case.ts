import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { IFamilyRepository } from '../../domain/repositories/family.repository.interface';
import { IFamilyInvitationRepository } from '../../domain/repositories/family-invitation.repository.interface';
import {
  FamilyMember,
  FamilyMemberRole,
} from '../../domain/entities/family-member.entity';
import { FamilyInvitationStatus } from '../../domain/entities/family-invitation.entity';
import { CreateNotificationUseCase } from '../../../../notification/core/application/use-cases/create-notification.use-case';
import {
  NotificationType,
  DeliveryMethod,
  NotificationPriority,
} from '../../../../notification/core/domain/value-objects/notification-type.vo';
import { v4 as uuid } from 'uuid';
import { UserService } from '~feature/user/core/application/services/user.service';

@Injectable()
export class AcceptInvitationUseCase {
  constructor(
    @Inject('FamilyRepository')
    private readonly familyRepository: IFamilyRepository,
    @Inject('FamilyInvitationRepository')
    private readonly invitationRepository: IFamilyInvitationRepository,
    private readonly createNotificationUseCase: CreateNotificationUseCase,
    private readonly userService: UserService,
  ) {}

  async execute(invitationId: string, userId: string): Promise<FamilyMember> {
    // Find invitation
    const invitation = await this.invitationRepository.findById(invitationId);
    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    // Validate invitation
    if (!invitation.canBeAccepted()) {
      throw new BadRequestException('Invitation expired or already processed');
    }

    // Add user to family
    const member = await this.familyRepository.addMember({
      id: uuid(),
      familyId: invitation.familyId,
      userId: userId,
      role: FamilyMemberRole.MEMBER,
      balance: 0,
      joinedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Update invitation status
    await this.invitationRepository.update(invitation.id, {
      status: FamilyInvitationStatus.ACCEPTED,
      inviteeId: userId,
      id: invitation.id,
      familyId: invitation.familyId,
      inviterId: invitation.inviterId,
      inviteeEmail: invitation.inviteeEmail,
      expiresAt: invitation.expiresAt,
      createdAt: invitation.createdAt,
      updatedAt: new Date(),
    });

    // Get family and user details for notifications
    const family = await this.familyRepository.findById(invitation.familyId);
    const invitee = await this.userService.findById(userId);

    // Notify inviter that invitation was accepted
    await this.createNotificationUseCase.execute({
      userId: invitation.inviterId,
      type: NotificationType.FAMILY_INVITATION_ACCEPTED,
      data: {
        invitationId: invitation.id,
        familyId: invitation.familyId,
        familyName: family?.name,
        inviteeName: invitee?.fullName,
      },
      deliveryMethods: [DeliveryMethod.IN_APP, DeliveryMethod.PUSH],
      priority: NotificationPriority.MEDIUM,
      familyId: invitation.familyId,
      invitationId: invitation.id,
    });

    // Notify all family members that someone joined
    const allMembers = await this.familyRepository.findMembers(
      invitation.familyId,
    );
    for (const familyMember of allMembers) {
      if (familyMember.userId === userId) continue;

      await this.createNotificationUseCase.execute({
        userId: familyMember.userId,
        type: NotificationType.FAMILY_MEMBER_JOINED,
        data: {
          familyId: invitation.familyId,
          familyName: family?.name,
          memberName: invitee?.fullName,
          memberId: userId,
        },
        deliveryMethods: [DeliveryMethod.IN_APP, DeliveryMethod.PUSH],
        priority: NotificationPriority.LOW,
        familyId: invitation.familyId,
      });
    }

    return member;
  }
}
