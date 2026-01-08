import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { IFamilyRepository } from '../../domain/repositories/family.repository.interface';
import { CreateNotificationUseCase } from '../../../../notification/core/application/use-cases/create-notification.use-case';
import {
  NotificationType,
  DeliveryMethod,
  NotificationPriority,
} from '../../../../notification/core/domain/value-objects/notification-type.vo';
import { UserService } from '~feature/user/core/application/services/user.service';

@Injectable()
export class RemoveFamilyMemberUseCase {
  constructor(
    @Inject('FamilyRepository')
    private readonly familyRepository: IFamilyRepository,
    private readonly createNotificationUseCase: CreateNotificationUseCase,
    private readonly userService: UserService,
  ) {}

  async execute(
    familyId: string,
    targetUserId: string,
    requestingUserId: string,
  ): Promise<void> {
    // Validate requesting user is a member with permission
    const requestingMember = await this.familyRepository.findMember(
      familyId,
      requestingUserId,
    );

    if (!requestingMember) {
      throw new NotFoundException('You are not a member of this family');
    }

    if (!requestingMember.canManageMembers()) {
      throw new ForbiddenException(
        'Only owners and admins can remove family members',
      );
    }

    // Prevent removing yourself
    if (targetUserId === requestingUserId) {
      throw new BadRequestException(
        'You cannot remove yourself. Use the leave family endpoint instead.',
      );
    }

    // Validate target user is a member
    const targetMember = await this.familyRepository.findMember(
      familyId,
      targetUserId,
    );

    if (!targetMember) {
      throw new NotFoundException(
        `User with ID ${targetUserId} is not a member of this family`,
      );
    }

    // Prevent removing the owner
    if (targetMember.isOwner()) {
      throw new BadRequestException('The family owner cannot be removed');
    }

    // Remove the member
    await this.familyRepository.removeMember(familyId, targetUserId);

    // Recalculate family balance after member removal
    const newBalance =
      await this.familyRepository.calculateFamilyBalance(familyId);
    await this.familyRepository.updateFamilyBalance(familyId, newBalance);

    // Get family and removed user details for notifications
    const family = await this.familyRepository.findById(familyId);
    const removedUser = await this.userService.findById(targetUserId);

    // Notify all remaining family members (except the admin who removed)
    const remainingMembers = await this.familyRepository.findMembers(familyId);
    for (const familyMember of remainingMembers) {
      if (familyMember.userId === requestingUserId) continue;

      await this.createNotificationUseCase.execute({
        userId: familyMember.userId,
        type: NotificationType.FAMILY_MEMBER_LEFT,
        data: {
          familyId: familyId,
          familyName: family?.name,
          memberName: removedUser?.fullName,
          memberId: targetUserId,
        },
        deliveryMethods: [DeliveryMethod.IN_APP, DeliveryMethod.PUSH],
        priority: NotificationPriority.LOW,
        familyId: familyId,
      });
    }

    // Notify the removed user
    await this.createNotificationUseCase.execute({
      userId: targetUserId,
      type: NotificationType.FAMILY_MEMBER_LEFT,
      data: {
        familyId: familyId,
        familyName: family?.name,
        memberName: 'You were',
        memberId: targetUserId,
      },
      deliveryMethods: [DeliveryMethod.IN_APP, DeliveryMethod.PUSH],
      priority: NotificationPriority.MEDIUM,
      familyId: familyId,
    });
  }
}
