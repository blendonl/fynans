import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { IFamilyInvitationRepository } from '../../domain/repositories/family-invitation.repository.interface';
import { IFamilyRepository } from '../../domain/repositories/family.repository.interface';
import { FamilyInvitationStatus } from '../../domain/entities/family-invitation.entity';
import { CreateNotificationUseCase } from '../../../../notification/core/application/use-cases/create-notification.use-case';
import {
  NotificationType,
  DeliveryMethod,
  NotificationPriority,
} from '../../../../notification/core/domain/value-objects/notification-type.vo';
import { UserService } from '~feature/user/core/application/services/user.service';

@Injectable()
export class DeclineInvitationUseCase {
  constructor(
    @Inject('FamilyInvitationRepository')
    private readonly invitationRepository: IFamilyInvitationRepository,
    @Inject('FamilyRepository')
    private readonly familyRepository: IFamilyRepository,
    private readonly createNotificationUseCase: CreateNotificationUseCase,
    private readonly userService: UserService,
  ) {}

  async execute(invitationId: string, userId: string): Promise<void> {
    const invitation = await this.invitationRepository.findById(invitationId);
    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (!invitation.canBeDeclined()) {
      throw new BadRequestException('Invitation expired or already processed');
    }

    await this.invitationRepository.update(invitation.id, {
      status: FamilyInvitationStatus.REJECTED,
      id: invitation.id,
      familyId: invitation.familyId,
      inviterId: invitation.inviterId,
      inviteeId: invitation.inviteeId,
      inviteeEmail: invitation.inviteeEmail,
      expiresAt: invitation.expiresAt,
      createdAt: invitation.createdAt,
      updatedAt: new Date(),
    });

    // Get family and decliner details for notification
    const family = await this.familyRepository.findById(invitation.familyId);
    const decliner = await this.userService.findById(userId);

    // Notify inviter that invitation was declined
    await this.createNotificationUseCase.execute({
      userId: invitation.inviterId,
      type: NotificationType.FAMILY_INVITATION_DECLINED,
      data: {
        invitationId: invitation.id,
        familyId: invitation.familyId,
        familyName: family?.name,
        inviteeName: decliner?.fullName || invitation.inviteeEmail,
      },
      deliveryMethods: [DeliveryMethod.IN_APP, DeliveryMethod.PUSH],
      priority: NotificationPriority.LOW,
      familyId: invitation.familyId,
      invitationId: invitation.id,
    });
  }
}
