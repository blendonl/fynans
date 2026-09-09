import { Injectable, Inject, Logger } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { INotificationRepository } from '../../domain/repositories/notification.repository.interface';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { Notification } from '../../domain/entities/notification.entity';
import { NotificationTemplateService } from '../services/notification-template.service';
import { NotificationDeliveryService } from '../services/notification-delivery.service';
import { NotificationPriority } from '../../domain/value-objects/notification-type.vo';

@Injectable()
export class CreateNotificationsUseCase {
  private readonly logger = new Logger(CreateNotificationsUseCase.name);

  constructor(
    @Inject('NotificationRepository')
    private readonly notificationRepository: INotificationRepository,
    private readonly templateService: NotificationTemplateService,
    private readonly deliveryService: NotificationDeliveryService,
  ) {}

  async execute(dtos: CreateNotificationDto[]): Promise<Notification[]> {
    if (dtos.length === 0) {
      return [];
    }

    const rows = dtos.map((dto) => {
      const template = this.templateService.generateTemplate(
        dto.type,
        dto.data || {},
      );

      return {
        id: uuid(),
        userId: dto.userId,
        type: dto.type,
        priority: dto.priority || NotificationPriority.MEDIUM,
        title: template.title,
        message: template.message,
        data: dto.data,
        deliveryMethods: dto.deliveryMethods,
        isRead: false,
        isInteracted: false,
        actionUrl: template.actionUrl,
        familyId: dto.familyId,
        transactionId: dto.transactionId,
        invitationId: dto.invitationId,
      };
    });

    const notifications = await this.notificationRepository.createMany(rows);

    await Promise.all(
      notifications.map((notification) =>
        this.deliveryService.deliver(notification).catch((error: Error) => {
          this.logger.error(
            `Failed to deliver notification to user ${notification.userId}`,
            error.stack ?? error.message,
          );
        }),
      ),
    );

    return notifications;
  }
}
