import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../common/prisma/prisma.service';
import {
  INotificationRepository,
  NotificationFilters,
} from '../../domain/repositories/notification.repository.interface';
import { Notification } from '../../domain/entities/notification.entity';
import { NotificationMapper } from '../mappers/notification.mapper';

@Injectable()
export class PrismaNotificationRepository implements INotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Partial<Notification>): Promise<Notification> {
    const notification = await this.prisma.notification.create({
      data: {
        id: data.id!,
        userId: data.userId!,
        type: data.type!,
        priority: data.priority!,
        title: data.title!,
        message: data.message!,
        data: data.data,
        deliveryMethods: data.deliveryMethods!,
        isRead: data.isRead ?? false,
        readAt: data.readAt,
        isInteracted: data.isInteracted ?? false,
        interactedAt: data.interactedAt,
        actionUrl: data.actionUrl,
        familyId: data.familyId,
        transactionId: data.transactionId,
        invitationId: data.invitationId,
      },
    });

    return NotificationMapper.toDomain(notification);
  }

  async findById(id: string): Promise<Notification | null> {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return null;
    }

    return NotificationMapper.toDomain(notification);
  }

  async findByUserId(filters: NotificationFilters): Promise<{ data: Notification[]; total: number }> {
    const {
      userId,
      type,
      unreadOnly,
      familyId,
      page = 1,
      limit = 20,
    } = filters;

    const where: any = { userId };

    if (type) {
      where.type = type;
    }

    if (unreadOnly) {
      where.isRead = false;
    }

    if (familyId) {
      where.familyId = familyId;
    }

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return { data: notifications.map(NotificationMapper.toDomain), total };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    const exists = await this.verifyOwnership(id, userId);
    if (!exists) {
      throw new NotFoundException('Notification not found');
    }

    await this.prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string, userId: string): Promise<void> {
    const exists = await this.verifyOwnership(id, userId);
    if (!exists) {
      throw new NotFoundException('Notification not found');
    }

    await this.prisma.notification.delete({
      where: { id },
    });
  }

  async verifyOwnership(notificationId: string, userId: string): Promise<boolean> {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
      select: { userId: true },
    });

    return notification?.userId === userId;
  }
}
