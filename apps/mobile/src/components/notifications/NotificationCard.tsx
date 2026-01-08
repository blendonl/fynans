import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '../../theme';
import { NotificationIcon } from './NotificationIcon';
import { getRelativeTime } from '../../utils/timeUtils';

interface NotificationCardProps {
  notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
  };
  onPress: () => void;
  isFirst?: boolean;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onPress,
  isFirst = false,
}) => {
  const { theme } = useAppTheme();

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (isFirst) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(1);
      slideAnim.setValue(0);
    }
  }, []);

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  };

  const getAccentColor = () => {
    const colorMap: Record<string, string> = {
      FAMILY_INVITATION: theme.colors.primary,
      EXPENSE_ADDED: theme.custom.colors.expense,
      INCOME_ADDED: theme.custom.colors.income,
      FAMILY_MEMBER_JOINED: theme.custom.colors.success,
      BUDGET_ALERT: theme.custom.colors.warning,
    };
    return colorMap[notification.type] || theme.custom.colors.info;
  };

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.container,
          {
            borderRadius: theme.custom.borderRadius.md,
            padding: theme.custom.spacing.md,
            marginBottom: theme.custom.spacing.sm,
            minHeight: 72,
            overflow: 'hidden',
            borderLeftWidth: 4,
            borderLeftColor: notification.isRead
              ? theme.colors.glassBorder
              : getAccentColor(),
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              },
              android: {
                elevation: 2,
              },
            }),
          },
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <BlurView
          intensity={Platform.OS === 'ios' ? 20 : 15}
          tint={theme.dark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />

        <LinearGradient
          colors={[`${theme.colors.surface}E6`, `${theme.colors.surface}CC`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <NotificationIcon type={notification.type} />

        <View style={styles.contentContainer}>
          <Text
            style={[
              styles.title,
              theme.custom.typography.bodyMedium,
              {
                color: theme.colors.onSurface,
                fontWeight: notification.isRead ? '500' : '700',
              },
            ]}
            numberOfLines={1}
          >
            {notification.title}
          </Text>
          <Text
            style={[
              styles.message,
              theme.custom.typography.small,
              { color: theme.custom.colors.textSecondary },
            ]}
            numberOfLines={2}
          >
            {notification.message}
          </Text>
          <Text
            style={[
              styles.timestamp,
              theme.custom.typography.small,
              { color: theme.custom.colors.textDisabled },
            ]}
          >
            {getRelativeTime(notification.createdAt)}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    marginBottom: 4,
  },
  message: {
    marginBottom: 4,
  },
  timestamp: {},
});
