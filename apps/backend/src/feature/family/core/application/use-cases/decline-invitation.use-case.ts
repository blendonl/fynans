import { Injectable, Inject } from '@nestjs/common';
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
import {
  DomainForbiddenException,
  DomainNotFoundException,
  DomainValidationException,
} from '~common/exceptions/domain.exceptions';

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
      throw new DomainNotFoundException('Invitation not found');
    }

    if (!invitation.canBeDeclined()) {
      throw new DomainValidationException(
        'Invitation expired or already processed',
      );
    }

    const decliner = await this.userService.findById(userId);

    const addressedToDecliner =
      invitation.inviteeId === userId ||
      invitation.inviteeEmail.toLowerCase() === decliner.email.toLowerCase();
    if (!addressedToDecliner) {
      throw new DomainForbiddenException(
        'Invitation was not addressed to this user',
      );
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

    const family = await this.familyRepository.findById(invitation.familyId);

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
