import { Injectable, Inject } from '@nestjs/common';
import { INotificationRepository } from '../../domain/repositories/notification.repository.interface';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { Notification } from '../../domain/entities/notification.entity';
import { NotificationTemplateService } from '../services/notification-template.service';
import { NotificationDeliveryService } from '../services/notification-delivery.service';
import { NotificationPriority } from '../../domain/value-objects/notification-type.vo';
import { v4 as uuid } from 'uuid';

@Injectable()
export class CreateNotificationUseCase {
  constructor(
    @Inject('NotificationRepository')
    private readonly notificationRepository: INotificationRepository,
    private readonly templateService: NotificationTemplateService,
    private readonly deliveryService: NotificationDeliveryService,
  ) {}

  async execute(dto: CreateNotificationDto): Promise<Notification> {
    const template = this.templateService.generateTemplate(dto.type, dto.data || {});

    const notification = await this.notificationRepository.create({
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
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.deliveryService.deliver(notification);

    return notification;
  }
}
