import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  SectionList,
  StyleSheet,
  RefreshControl,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useNotifications } from '../../context/NotificationContext';
import { useAppTheme } from '../../theme';
import { transactionService } from '../../services/transactionService';
import { SwipeableNotification } from '../../components/notifications/SwipeableNotification';
import { NotificationSectionHeader } from '../../components/notifications/NotificationSectionHeader';

interface NotificationSection {
  title: string;
  data: any[];
}

const groupNotificationsByDate = (notifications: any[]): NotificationSection[] => {
  const now = new Date();
  const today: any[] = [];
  const yesterday: any[] = [];
  const earlier: any[] = [];

  notifications.forEach((notif) => {
    const diffMs = now.getTime() - new Date(notif.createdAt).getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 24) {
      today.push(notif);
    } else if (diffHours < 48) {
      yesterday.push(notif);
    } else {
      earlier.push(notif);
    }
  });

  const sections: NotificationSection[] = [];
  if (today.length > 0) sections.push({ title: 'Today', data: today });
  if (yesterday.length > 0) sections.push({ title: 'Yesterday', data: yesterday });
  if (earlier.length > 0) sections.push({ title: 'Earlier', data: earlier });

  return sections;
};

export default function NotificationsScreen({ navigation }: any) {
  const {
    notifications,
    loading,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();
  const { theme } = useAppTheme();
  const [navigating, setNavigating] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [])
  );

  const sections = useMemo(
    () => groupNotificationsByDate(notifications),
    [notifications]
  );

  const handleNotificationPress = async (notification: any) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    if (notification.type === 'FAMILY_EXPENSE_CREATED' && notification.data?.expenseId) {
      try {
        setNavigating(true);
        const transaction = await transactionService.fetchExpenseById(notification.data.expenseId);
        navigation.navigate('TransactionDetail', { transaction });
      } catch (error) {
        console.error('Failed to fetch expense:', error);
      } finally {
        setNavigating(false);
      }
    } else if (notification.type === 'FAMILY_INCOME_CREATED' && notification.data?.incomeId) {
      try {
        setNavigating(true);
        const transaction = await transactionService.fetchIncomeById(notification.data.incomeId);
        navigation.navigate('TransactionDetail', { transaction });
      } catch (error) {
        console.error('Failed to fetch income:', error);
      } finally {
        setNavigating(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      {unreadCount > 0 && (
        <View style={styles.markAllReadContainer}>
          <TouchableOpacity
            style={[
              styles.markAllReadButton,
              {
                borderRadius: theme.custom.borderRadius.sm,
                overflow: 'hidden',
              },
            ]}
            onPress={markAllAsRead}
          >
            <BlurView
              intensity={20}
              tint={theme.dark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />
            <Text
              style={[
                styles.markAllReadText,
                { color: theme.colors.primary },
              ]}
            >
              Mark all as read
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index, section }) => (
          <SwipeableNotification
            notification={item}
            onPress={() => handleNotificationPress(item)}
            onDelete={() => handleDelete(item.id)}
            isFirst={index === 0 && section.title === sections[0]?.title}
          />
        )}
        renderSectionHeader={({ section, section: { title } }) => (
          <NotificationSectionHeader
            title={title}
            isFirst={sections[0]?.title === title}
          />
        )}
        stickySectionHeadersEnabled={true}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchNotifications} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="bell-outline"
              size={64}
              color={theme.custom.colors.textDisabled}
            />
            <Text
              style={[
                styles.emptyTitle,
                {
                  color: theme.colors.onSurface,
                  marginTop: theme.custom.spacing.md,
                },
              ]}
            >
              No notifications
            </Text>
            <Text
              style={[
                styles.emptyDescription,
                {
                  color: theme.custom.colors.textSecondary,
                  marginTop: theme.custom.spacing.xs,
                },
              ]}
            >
              You're all caught up!
            </Text>
          </View>
        }
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: unreadCount > 0 ? 60 : 16,
          },
        ]}
      />
      {navigating && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  markAllReadContainer: {
    position: 'absolute',
    top: 24,
    right: 16,
    zIndex: 10,
  },
  markAllReadButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  markAllReadText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptyDescription: {
    fontSize: 14,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
