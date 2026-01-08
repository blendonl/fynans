import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from '../design-system';
import { useAppTheme } from '../../theme';
import { TrendIndicator } from './TrendIndicator';

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  color?: string;
  subtitle?: string;
  trend?: number; // Percentage change
  progress?: number; // 0-100 for progress bar
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  subtitle,
  trend,
  progress,
}) => {
  const { theme } = useAppTheme();
  const iconColor = color || theme.colors.primary;

  return (
    <Card style={styles.card} elevation={2}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
          <MaterialCommunityIcons name={icon as any} size={28} color={iconColor} />
        </View>
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.title,
                theme.custom.typography.caption,
                { color: theme.custom.colors.textSecondary },
              ]}
            >
              {title}
            </Text>
            {trend !== undefined && <TrendIndicator value={trend} compact />}
          </View>
          <Text
            style={[
              styles.value,
              theme.custom.typography.h4,
              { color: theme.custom.colors.text },
            ]}
          >
            {value}
          </Text>
          {subtitle && (
            <Text
              style={[
                styles.subtitle,
                theme.custom.typography.small,
                { color: theme.custom.colors.textSecondary },
              ]}
            >
              {subtitle}
            </Text>
          )}
          {progress !== undefined && (
            <View style={styles.progressContainer}>
              <View
                style={[
                  styles.progressBackground,
                  { backgroundColor: theme.custom.colors.border },
                ]}
              >
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${Math.min(progress, 100)}%`,
                      backgroundColor: iconColor,
                    },
                  ]}
                />
              </View>
            </View>
          )}
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    marginHorizontal: 4,
    marginBottom: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {},
  value: {},
  subtitle: {
    marginTop: 2,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBackground: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
});
