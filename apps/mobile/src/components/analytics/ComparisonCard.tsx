import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from '../design-system';
import { useAppTheme } from '../../theme';

interface ComparisonCardProps {
    title: string;
    currentValue: number;
    previousValue: number;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    color: string;
    subtitle?: string;
    formatValue?: (value: number) => string;
    invertColors?: boolean; // For expenses where decrease is good
}

export const ComparisonCard: React.FC<ComparisonCardProps> = ({
    title,
    currentValue,
    previousValue,
    icon,
    color,
    subtitle,
    formatValue = (val) => `$${val.toFixed(2)}`,
    invertColors = false,
}) => {
    const { theme } = useAppTheme();

    const percentageChange =
        previousValue > 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0;
    const absoluteChange = currentValue - previousValue;

    const isIncrease = percentageChange > 0;
    const isPositive = invertColors ? !isIncrease : isIncrease;

    const trendColor =
        Math.abs(percentageChange) < 0.01
            ? theme.custom.colors.textSecondary
            : isPositive
                ? theme.custom.colors.success
                : theme.custom.colors.error;

    const trendIcon =
        Math.abs(percentageChange) < 0.01
            ? 'minus'
            : isIncrease
                ? 'trending-up'
                : 'trending-down';

    return (
        <Card style={styles.card} elevation={2}>
            <View style={styles.header}>
                <MaterialCommunityIcons name={icon} size={24} color={color} />
                <Text
                    style={[
                        styles.title,
                        theme.custom.typography.caption,
                        { color: theme.custom.colors.textSecondary },
                    ]}
                >
                    {title}
                </Text>
            </View>

            <Text
                style={[
                    styles.value,
                    theme.custom.typography.h4,
                    { color: theme.custom.colors.text },
                ]}
            >
                {formatValue(currentValue)}
            </Text>

            {subtitle && (
                <Text
                    style={[
                        styles.subtitle,
                        theme.custom.typography.caption,
                        { color: theme.custom.colors.textSecondary },
                    ]}
                >
                    {subtitle}
                </Text>
            )}

            <View style={styles.comparison}>
                <MaterialCommunityIcons name={trendIcon} size={16} color={trendColor} />
                <Text
                    style={[
                        styles.changeText,
                        theme.custom.typography.caption,
                        { color: trendColor },
                    ]}
                    numberOfLines={1}
                >
                    {Math.abs(percentageChange) < 0.01
                        ? 'No change'
                        : `${percentageChange > 0 ? '+' : ''}${percentageChange.toFixed(1)}%`}
                </Text>
                <Text
                    style={[
                        styles.previousText,
                        theme.custom.typography.caption,
                        { color: theme.custom.colors.textSecondary },
                    ]}
                    numberOfLines={1}
                >
                    vs prev
                </Text>
            </View>

            {Math.abs(absoluteChange) > 0.01 && (
                <Text
                    style={[
                        styles.absoluteChange,
                        theme.custom.typography.caption,
                        { color: theme.custom.colors.textSecondary },
                    ]}
                >
                    {absoluteChange > 0 ? '+' : ''}
                    {formatValue(absoluteChange)} from {formatValue(previousValue)}
                </Text>
            )}
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        flex: 1,
        margin: 4,
        padding: 12,
        minWidth: 160,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    title: {
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    value: {
        fontWeight: '700',
        marginBottom: 4,
    },
    subtitle: {
        marginBottom: 8,
    },
    comparison: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
        flexWrap: 'wrap',
    },
    changeText: {
        fontWeight: '600',
    },
    previousText: {
        flexShrink: 1,
    },
    absoluteChange: {
        marginTop: 4,
    },
});
