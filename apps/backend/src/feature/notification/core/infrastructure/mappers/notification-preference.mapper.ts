import { Prisma } from 'prisma/generated/prisma/client';
import { NotificationPreference } from '../../domain/entities/notification-preference.entity';

type PrismaNotificationPreference = Prisma.NotificationPreferenceGetPayload<object>;

export class NotificationPreferenceMapper {
  static toDomain(
    prismaPreference: PrismaNotificationPreference,
  ): NotificationPreference {
    return new NotificationPreference({
      id: prismaPreference.id,
      userId: prismaPreference.userId,
      enablePushNotifications: prismaPreference.enablePushNotifications,
      enableInAppNotifications: prismaPreference.enableInAppNotifications,
      enableToastNotifications: prismaPreference.enableToastNotifications,
      quietHoursEnabled: prismaPreference.quietHoursEnabled,
      quietHoursStart: prismaPreference.quietHoursStart || undefined,
      quietHoursEnd: prismaPreference.quietHoursEnd || undefined,
      typePreferences: prismaPreference.typePreferences as Record<string, any>,
      createdAt: prismaPreference.createdAt,
      updatedAt: prismaPreference.updatedAt,
    });
  }
}
