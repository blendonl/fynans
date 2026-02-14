import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { NotificationGateway } from '../../../websocket/notification.gateway';
import { ExpoPushNotificationService } from '../../infrastructure/services/expo-push-notification.service';
import { WebPushNotificationService } from '../../infrastructure/services/web-push-notification.service';
import { NotificationPreferenceService } from './notification-preference.service';
import { Notification } from '../../domain/entities/notification.entity';
import { DeliveryMethod } from '../../domain/value-objects/notification-type.vo';

@Injectable()
export class NotificationDeliveryService {
  constructor(
    @Inject(forwardRef(() => NotificationGateway))
    private readonly notificationGateway: NotificationGateway,
    private readonly pushNotificationService: ExpoPushNotificationService,
    private readonly webPushNotificationService: WebPushNotificationService,
    private readonly preferenceService: NotificationPreferenceService,
  ) {}

  async deliver(notification: Notification): Promise<void> {
    // Get user preferences
    const preferences = await this.preferenceService.getOrCreateDefaults(
      notification.userId,
    );

    // Check quiet hours
    let deliveryMethods = notification.deliveryMethods;
    if (this.preferenceService.isInQuietHours(preferences)) {
      // Skip PUSH and TOAST during quiet hours, but allow IN_APP
      deliveryMethods = notification.deliveryMethods.filter(
        (method) => method === DeliveryMethod.IN_APP,
      );

      if (deliveryMethods.length === 0) {
        console.log(
          `Notification ${notification.id} skipped due to quiet hours`,
        );
        return;
      }
    }

    // Check per-type preferences
    const allowedMethods = this.preferenceService.getAllowedDeliveryMethods(
      preferences,
      notification.type,
    );

    // Deliver via allowed methods
    for (const method of deliveryMethods) {
      if (!allowedMethods.includes(method)) continue;

      switch (method) {
        case DeliveryMethod.PUSH:
          await this.deliverPush(notification);
          break;
        case DeliveryMethod.IN_APP:
          await this.deliverInApp(notification);
          break;
        case DeliveryMethod.TOAST:
          await this.deliverToast(notification);
          break;
      }
    }
  }

  private async deliverPush(notification: Notification): Promise<void> {
    const pushData = {
      title: notification.title,
      message: notification.message,
      data: {
        notificationId: notification.id,
        type: notification.type,
        actionUrl: notification.actionUrl,
        ...notification.data,
      },
    };

    // Expo (mobile)
    try {
      await this.pushNotificationService.sendToUser(
        notification.userId,
        pushData,
      );
    } catch (error) {
      console.error('Error delivering Expo push:', error);
    }

    // Web Push
    try {
      await this.webPushNotificationService.sendToUser(
        notification.userId,
        pushData,
      );
    } catch (error) {
      console.error('Error delivering web push:', error);
    }
  }

  private async deliverInApp(notification: Notification): Promise<void> {
    // Emit via WebSocket
    this.notificationGateway.emitToUser(
      notification.userId,
      'notification:new',
      notification.toJSON(),
    );
  }

  private async deliverToast(notification: Notification): Promise<void> {
    // Emit via WebSocket with toast flag
    this.notificationGateway.emitToUser(
      notification.userId,
      'notification:toast',
      {
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
      },
    );
  }
}
