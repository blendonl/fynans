import { Injectable, Inject } from '@nestjs/common';
import { INotificationPreferenceRepository } from '../../domain/repositories/notification-preference.repository.interface';
import { NotificationPreference } from '../../domain/entities/notification-preference.entity';
import { NotificationType, DeliveryMethod } from '../../domain/value-objects/notification-type.vo';

@Injectable()
export class NotificationPreferenceService {
  constructor(
    @Inject('NotificationPreferenceRepository')
    private readonly preferenceRepository: INotificationPreferenceRepository,
  ) {}

  async getOrCreateDefaults(userId: string): Promise<NotificationPreference> {
    return await this.preferenceRepository.getOrCreateDefaults(userId);
  }

  isInQuietHours(preference: NotificationPreference): boolean {
    if (!preference.quietHoursEnabled) {
      return false;
    }

    if (!preference.quietHoursStart || !preference.quietHoursEnd) {
      return false;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const startTime =
      preference.quietHoursStart.getHours() * 60 +
      preference.quietHoursStart.getMinutes();
    const endTime =
      preference.quietHoursEnd.getHours() * 60 +
      preference.quietHoursEnd.getMinutes();

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  getAllowedDeliveryMethods(
    preference: NotificationPreference,
    type: NotificationType,
  ): DeliveryMethod[] {
    const allowed: DeliveryMethod[] = [];

    if (preference.enablePushNotifications) {
      allowed.push(DeliveryMethod.PUSH);
    }
    if (preference.enableInAppNotifications) {
      allowed.push(DeliveryMethod.IN_APP);
    }
    if (preference.enableToastNotifications) {
      allowed.push(DeliveryMethod.TOAST);
    }

    const typePrefs = preference.typePreferences[type];
    if (typePrefs) {
      return allowed.filter((method) => {
        switch (method) {
          case DeliveryMethod.PUSH:
            return typePrefs.push !== false;
          case DeliveryMethod.IN_APP:
            return typePrefs.inApp !== false;
          case DeliveryMethod.TOAST:
            return typePrefs.toast !== false;
          default:
            return true;
        }
      });
    }

    return allowed;
  }
}
