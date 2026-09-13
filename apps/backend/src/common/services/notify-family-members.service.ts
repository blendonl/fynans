import { Injectable, Logger } from '@nestjs/common';
import { FamilyService } from '~feature/family/core/application/services/family.service';
import { CreateNotificationsUseCase } from '~feature/notification/core/application/use-cases/create-notifications.use-case';
import { UserService } from '~feature/user/core/application/services/user.service';
import { CreateNotificationDto } from '~feature/notification/core/application/dto/create-notification.dto';
import {
  DeliveryMethod,
  NotificationPriority,
  NotificationType,
} from '~feature/notification/core/domain/value-objects/notification-type.vo';

interface FamilyNotificationOptions {
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
    private readonly createNotificationsUseCase: CreateNotificationsUseCase,
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

    const recipients = members.filter(
      (member) => member.userId !== actorUserId,
    );

    try {
      await this.createNotificationsUseCase.execute(
        recipients.map(
          (member) =>
            ({
              userId: member.userId,
              type,
              data: enrichedData,
              deliveryMethods: [DeliveryMethod.IN_APP, DeliveryMethod.PUSH],
              priority: priority ?? NotificationPriority.LOW,
              familyId,
            }) as CreateNotificationDto,
        ),
      );
    } catch (error) {
      this.logger.error(
        `Failed to notify family ${familyId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
