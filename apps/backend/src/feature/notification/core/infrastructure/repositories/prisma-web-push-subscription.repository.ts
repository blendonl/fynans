import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../common/prisma/prisma.service';
import { IWebPushSubscriptionRepository } from '../../domain/repositories/web-push-subscription.repository.interface';
import { WebPushSubscription } from '../../domain/entities/web-push-subscription.entity';
import { WebPushSubscriptionMapper } from '../mappers/web-push-subscription.mapper';

@Injectable()
export class PrismaWebPushSubscriptionRepository
  implements IWebPushSubscriptionRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Partial<WebPushSubscription>): Promise<WebPushSubscription> {
    const subscription = await this.prisma.webPushSubscription.create({
      data: {
        id: data.id!,
        userId: data.userId!,
        endpoint: data.endpoint!,
        p256dh: data.p256dh!,
        auth: data.auth!,
        userAgent: data.userAgent,
        isActive: data.isActive ?? true,
        lastUsed: data.lastUsed ?? new Date(),
      },
    });

    return WebPushSubscriptionMapper.toDomain(subscription);
  }

  async findByEndpoint(
    endpoint: string,
  ): Promise<WebPushSubscription | null> {
    const subscription = await this.prisma.webPushSubscription.findUnique({
      where: { endpoint },
    });

    if (!subscription) {
      return null;
    }

    return WebPushSubscriptionMapper.toDomain(subscription);
  }

  async findActiveByUserId(userId: string): Promise<WebPushSubscription[]> {
    const subscriptions = await this.prisma.webPushSubscription.findMany({
      where: {
        userId,
        isActive: true,
      },
    });

    return subscriptions.map(WebPushSubscriptionMapper.toDomain);
  }

  async deactivate(id: string): Promise<void> {
    await this.prisma.webPushSubscription.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });
  }

  async delete(endpoint: string, userId: string): Promise<void> {
    const subscription = await this.prisma.webPushSubscription.findUnique({
      where: { endpoint },
      select: { userId: true },
    });

    if (!subscription || subscription.userId !== userId) {
      throw new NotFoundException('Web push subscription not found');
    }

    await this.prisma.webPushSubscription.delete({
      where: { endpoint },
    });
  }

  async updateLastUsed(id: string): Promise<void> {
    await this.prisma.webPushSubscription.update({
      where: { id },
      data: {
        lastUsed: new Date(),
        updatedAt: new Date(),
      },
    });
  }
}
