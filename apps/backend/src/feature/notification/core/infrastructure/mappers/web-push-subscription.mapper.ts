import { Prisma } from 'prisma/generated/prisma/client';
import { WebPushSubscription } from '../../domain/entities/web-push-subscription.entity';

type PrismaWebPushSubscription =
  Prisma.WebPushSubscriptionGetPayload<object>;

export class WebPushSubscriptionMapper {
  static toDomain(
    prismaSubscription: PrismaWebPushSubscription,
  ): WebPushSubscription {
    return new WebPushSubscription({
      id: prismaSubscription.id,
      userId: prismaSubscription.userId,
      endpoint: prismaSubscription.endpoint,
      p256dh: prismaSubscription.p256dh,
      auth: prismaSubscription.auth,
      userAgent: prismaSubscription.userAgent || undefined,
      isActive: prismaSubscription.isActive,
      lastUsed: prismaSubscription.lastUsed,
      createdAt: prismaSubscription.createdAt,
      updatedAt: prismaSubscription.updatedAt,
    });
  }

  static toPersistence(subscription: WebPushSubscription) {
    return {
      id: subscription.id,
      userId: subscription.userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.p256dh,
      auth: subscription.auth,
      userAgent: subscription.userAgent,
      isActive: subscription.isActive,
      lastUsed: subscription.lastUsed,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
    };
  }
}
