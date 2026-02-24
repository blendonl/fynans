import {
  Injectable,
  Inject,
  NotFoundException,
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
export class LeaveFamilyUseCase {
  constructor(
    @Inject('FamilyRepository')
    private readonly familyRepository: IFamilyRepository,
    private readonly createNotificationUseCase: CreateNotificationUseCase,
    private readonly userService: UserService,
  ) {}

  async execute(familyId: string, userId: string): Promise<void> {
    const member = await this.familyRepository.findMember(familyId, userId);
    if (!member) {
      throw new NotFoundException('Not a family member');
    }

    if (member.isOwner()) {
      const allMembers = await this.familyRepository.findMembers(familyId);
      if (allMembers.length > 1) {
        throw new BadRequestException(
          'Owner must transfer ownership or remove all members before leaving',
        );
      }
      await this.familyRepository.delete(familyId);
      return;
    }

    await this.familyRepository.removeMember(familyId, userId);

    const family = await this.familyRepository.findById(familyId);
    const leavingUser = await this.userService.findById(userId);

    const remainingMembers = await this.familyRepository.findMembers(familyId);
    for (const familyMember of remainingMembers) {
      await this.createNotificationUseCase.execute({
        userId: familyMember.userId,
        type: NotificationType.FAMILY_MEMBER_LEFT,
        data: {
          familyId: familyId,
          familyName: family?.name,
          memberName: leavingUser?.fullName,
          memberId: userId,
        },
        deliveryMethods: [DeliveryMethod.IN_APP, DeliveryMethod.PUSH],
        priority: NotificationPriority.LOW,
        familyId: familyId,
      });
    }
  }
}
