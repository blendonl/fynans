import { Injectable, Inject } from '@nestjs/common';
import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { IDeviceTokenRepository } from '../../domain/repositories/device-token.repository.interface';

@Injectable()
export class ExpoPushNotificationService {
  private expo: Expo;

  constructor(
    @Inject('DeviceTokenRepository')
    private readonly deviceTokenRepository: IDeviceTokenRepository,
  ) {
    this.expo = new Expo();
  }

  async sendToUser(
    userId: string,
    notification: {
      title: string;
      message: string;
      data?: Record<string, any>;
    },
  ): Promise<void> {
    const deviceTokens = await this.deviceTokenRepository.findActiveByUserId(
      userId,
    );

    if (deviceTokens.length === 0) {
      console.log(`No device tokens found for user ${userId}`);
      return;
    }

    const messages: ExpoPushMessage[] = deviceTokens
      .filter((token) => Expo.isExpoPushToken(token.expoPushToken))
      .map((token) => ({
        to: token.expoPushToken,
        sound: 'default' as const,
        title: notification.title,
        body: notification.message,
        data: notification.data || {},
      }));

    if (messages.length === 0) {
      console.log(`No valid Expo push tokens for user ${userId}`);
      return;
    }

    const chunks = this.expo.chunkPushNotifications(messages);
    const tickets: ExpoPushTicket[] = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error sending push notification chunk:', error);
      }
    }

    await this.handleInvalidTokens(tickets, deviceTokens);
  }

  private async handleInvalidTokens(
    tickets: ExpoPushTicket[],
    deviceTokens: any[],
  ): Promise<void> {
    tickets.forEach((ticket, index) => {
      if (ticket.status === 'error') {
        if (
          ticket.details?.error === 'DeviceNotRegistered' ||
          ticket.details?.error === 'InvalidCredentials'
        ) {
          const token = deviceTokens[index];
          if (token) {
            this.deviceTokenRepository.deactivate(token.id);
          }
        }
      }
    });
  }
}
