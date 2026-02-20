import { Injectable, Logger } from '@nestjs/common';
import { FamilyService } from '~feature/family/core/application/services/family.service';
import { CreateNotificationUseCase } from '~feature/notification/core/application/use-cases/create-notification.use-case';
import { UserService } from '~feature/user/core/application/services/user.service';
import { CreateNotificationDto } from '~feature/notification/core/application/dto/create-notification.dto';
import {
  DeliveryMethod,
  NotificationPriority,
  NotificationType,
} from '~feature/notification/core/domain/value-objects/notification-type.vo';

export interface FamilyNotificationOptions {
  familyId: string;
  actorUserId: string;
  type: NotificationType;
  data: Record<string, any>;
  priority?: NotificationPriority;
}

@Injectable()
export class NotifyFamilyMembersService {
  private readonly logger = new Logger(NotifyFamilyMembersService.name);

  constructor(
    private readonly familyService: FamilyService,
    private readonly createNotificationUseCase: CreateNotificationUseCase,
    private readonly userService: UserService,
  ) {}

  async notify(options: FamilyNotificationOptions): Promise<void> {
    const { familyId, actorUserId, type, data, priority } = options;

    const [family, actor, members] = await Promise.all([
      this.familyService.findById(familyId),
      this.userService.findById(actorUserId),
      this.familyService.findMembers(familyId),
    ]);

    const enrichedData = {
      ...data,
      familyId,
      familyName: family?.name,
      userName: actor?.fullName,
    };

    await Promise.all(
      members
        .filter((member) => member.userId !== actorUserId)
        .map((member) =>
          this.createNotificationUseCase
            .execute({
              userId: member.userId,
              type,
              data: enrichedData,
              deliveryMethods: [DeliveryMethod.IN_APP, DeliveryMethod.PUSH],
              priority: priority ?? NotificationPriority.LOW,
              familyId,
            } as CreateNotificationDto)
            .catch((err) => {
              this.logger.error(
                `Failed to send notification to user ${member.userId}`,
                err?.stack ?? err,
              );
            }),
        ),
    );
  }
}
