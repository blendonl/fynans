import { Prisma } from 'prisma/generated/prisma/client';
import { Notification } from '../../domain/entities/notification.entity';
import {
  NotificationType,
  NotificationPriority,
  DeliveryMethod,
} from '../../domain/value-objects/notification-type.vo';

type PrismaNotification = Prisma.NotificationGetPayload<object>;

export class NotificationMapper {
  static toDomain(prismaNotification: PrismaNotification): Notification {
    return new Notification({
      id: prismaNotification.id,
      userId: prismaNotification.userId,
      type: prismaNotification.type as NotificationType,
      priority: prismaNotification.priority as NotificationPriority,
      title: prismaNotification.title,
      message: prismaNotification.message,
      data: prismaNotification.data as Record<string, any> | undefined,
      deliveryMethods: prismaNotification.deliveryMethods as DeliveryMethod[],
      isRead: prismaNotification.isRead,
      readAt: prismaNotification.readAt || undefined,
      isInteracted: prismaNotification.isInteracted,
      interactedAt: prismaNotification.interactedAt || undefined,
      actionUrl: prismaNotification.actionUrl || undefined,
      familyId: prismaNotification.familyId || undefined,
      transactionId: prismaNotification.transactionId || undefined,
      invitationId: prismaNotification.invitationId || undefined,
      createdAt: prismaNotification.createdAt,
      updatedAt: prismaNotification.updatedAt,
    });
  }
}
