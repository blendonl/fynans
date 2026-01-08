import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../../theme';

interface NotificationIconProps {
  type: string;
}

const getNotificationIconConfig = (type: string, theme: any) => {
  const configs = {
    FAMILY_INVITATION: {
      icon: 'account-group-outline',
      color: theme.colors.primary,
    },
    EXPENSE_ADDED: {
      icon: 'cart-outline',
      color: theme.custom.colors.expense,
    },
    INCOME_ADDED: {
      icon: 'cash-plus',
      color: theme.custom.colors.income,
    },
    FAMILY_MEMBER_JOINED: {
      icon: 'account-plus',
      color: theme.custom.colors.success,
    },
    BUDGET_ALERT: {
      icon: 'alert-circle-outline',
      color: theme.custom.colors.warning,
    },
  };

  return configs[type as keyof typeof configs] || {
    icon: 'bell-outline',
    color: theme.custom.colors.info,
  };
};

export const NotificationIcon: React.FC<NotificationIconProps> = ({ type }) => {
  const { theme } = useAppTheme();
  const config = getNotificationIconConfig(type, theme);

  return (
    <View
      style={[
        styles.container,
        {
          borderRadius: theme.custom.borderRadius.round,
          overflow: 'hidden',
          ...Platform.select({
            ios: {
              shadowColor: config.color,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
            },
            android: {
              elevation: 3,
            },
          }),
        },
      ]}
    >
      <LinearGradient
        colors={[`${config.color}28`, `${config.color}18`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <MaterialCommunityIcons
        name={config.icon as any}
        size={24}
        color={config.color}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
