import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useAppTheme } from '../../theme';

interface NotificationSectionHeaderProps {
  title: string;
  isFirst?: boolean;
}

export const NotificationSectionHeader: React.FC<NotificationSectionHeaderProps> = ({
  title,
  isFirst = false,
}) => {
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        {
          marginTop: isFirst ? 0 : theme.custom.spacing.lg,
          borderRadius: theme.custom.borderRadius.sm,
          overflow: 'hidden',
        },
      ]}
    >
      <BlurView
        intensity={Platform.OS === 'ios' ? 10 : 8}
        tint={theme.dark ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />
      <Text
        style={[
          styles.title,
          {
            color: theme.colors.onSurface,
            fontWeight: '600',
          },
        ]}
      >
        {title}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
  },
});
