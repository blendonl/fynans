import { Injectable, Inject } from '@nestjs/common';
import * as webpush from 'web-push';
import { IWebPushSubscriptionRepository } from '../../domain/repositories/web-push-subscription.repository.interface';

@Injectable()
export class WebPushNotificationService {
  constructor(
    @Inject('WebPushSubscriptionRepository')
    private readonly subscriptionRepository: IWebPushSubscriptionRepository,
  ) {
    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    const vapidSubject = process.env.VAPID_SUBJECT;

    if (vapidPublicKey && vapidPrivateKey && vapidSubject) {
      webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
    }
  }

  async sendToUser(
    userId: string,
    notification: {
      title: string;
      message: string;
      data?: Record<string, any>;
    },
  ): Promise<void> {
    const subscriptions =
      await this.subscriptionRepository.findActiveByUserId(userId);

    if (subscriptions.length === 0) {
      return;
    }

    const payload = JSON.stringify({
      title: notification.title,
      body: notification.message,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      data: notification.data || {},
    });

    for (const subscription of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          payload,
        );
        await this.subscriptionRepository.updateLastUsed(subscription.id);
      } catch (error: any) {
        if (error.statusCode === 404 || error.statusCode === 410) {
          await this.subscriptionRepository.deactivate(subscription.id);
        } else {
          console.error(
            `Error sending web push to subscription ${subscription.id}:`,
            error,
          );
        }
      }
    }
  }
}
