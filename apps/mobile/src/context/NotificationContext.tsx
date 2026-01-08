import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useToast, ToastData } from './ToastContext';
import { notificationService } from '../services/notificationService';
import { websocketService } from '../services/websocketService';
import { pushNotificationService } from '../services/pushNotificationService';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  data?: any;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const unreadCountRef = useRef(unreadCount);

  useEffect(() => {
    unreadCountRef.current = unreadCount;
  }, [unreadCount]);

  const handleNewNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => {
      const newCount = prev + 1;
      pushNotificationService.setBadgeCount(newCount);
      return newCount;
    });
  }, []);

  const handleToastNotification = useCallback((data: any) => {
    showToast({
      type: data.type,
      title: data.title,
      message: data.message,
      actionUrl: data.actionUrl,
    });
  }, [showToast]);

  useEffect(() => {
    let cleanupPushListeners: (() => void) | undefined;

    if (user && token) {
      initializeNotifications().then((cleanup) => {
        cleanupPushListeners = cleanup;
      });
    }

    return () => {
      if (cleanupPushListeners) {
        cleanupPushListeners();
      }
      websocketService.off('notification:new', handleNewNotification);
      websocketService.off('notification:toast', handleToastNotification);
      websocketService.disconnect();
    };
  }, [user, token, handleNewNotification, handleToastNotification]);

  const initializeNotifications = async () => {
    await pushNotificationService.registerForPushNotifications();

    const cleanupListeners = pushNotificationService.setupNotificationListeners(
      () => {},
      (response) => {
        const notificationData = response.notification.request.content.data;
        if (notificationData) {
          pushNotificationService.handleTransactionNotificationTap(notificationData);
        }
      },
    );

    websocketService.connect(token!);
    websocketService.on('notification:new', handleNewNotification);
    websocketService.on('notification:toast', handleToastNotification);
    await fetchNotifications();
    await fetchUnreadCount();

    return cleanupListeners;
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data || []);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const { count } = await notificationService.getUnreadCount();
      setUnreadCount(count);
      pushNotificationService.setBadgeCount(count);
    } catch (error) {
      console.error('Failed to fetch unread count', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      const newCount = Math.max(0, unreadCount - 1);
      setUnreadCount(newCount);
      pushNotificationService.setBadgeCount(newCount);
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      pushNotificationService.setBadgeCount(0);
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error('Failed to delete notification', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider',
    );
  }
  return context;
};
