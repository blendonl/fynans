import {
  notificationControllerGetNotifications,
  notificationControllerGetUnreadCount,
  notificationControllerMarkAsRead,
  notificationControllerMarkAllAsRead,
  notificationControllerDeleteNotification,
} from '../api/generated/endpoints/notification/notification';
import {
  notificationPreferenceControllerGetPreferences,
  notificationPreferenceControllerUpdatePreferences,
} from '../api/generated/endpoints/notification-preference/notification-preference';
import type { UpdatePreferenceRequestDto } from '../api/generated/model';

export const notificationService = {
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    type?: string;
    unreadOnly?: boolean;
  }) {
    const response = await notificationControllerGetNotifications({
      page: params?.page?.toString(),
      limit: params?.limit?.toString(),
      type: params?.type,
      unreadOnly: params?.unreadOnly?.toString(),
    });
    return response.data.data;
  },

  async getUnreadCount() {
    return (await notificationControllerGetUnreadCount()).data;
  },

  async markAsRead(id: string) {
    await notificationControllerMarkAsRead(id);
  },

  async markAllAsRead() {
    await notificationControllerMarkAllAsRead();
  },

  async deleteNotification(id: string) {
    await notificationControllerDeleteNotification(id);
  },

  async getPreferences() {
    return (await notificationPreferenceControllerGetPreferences()).data;
  },

  async updatePreferences(preferences: UpdatePreferenceRequestDto) {
    return (await notificationPreferenceControllerUpdatePreferences(preferences)).data;
  },
};
