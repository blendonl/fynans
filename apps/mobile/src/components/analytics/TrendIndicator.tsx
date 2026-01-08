import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../theme';

interface TrendIndicatorProps {
    value: number; // Percentage change
    compact?: boolean;
}

export const TrendIndicator: React.FC<TrendIndicatorProps> = ({ value, compact = false }) => {
    const { theme } = useAppTheme();

    const isPositive = value > 0;
    const isNeutral = value === 0;

    // For expenses, positive is bad (red), for income/savings positive is good (green)
    const color = isNeutral
        ? theme.custom.colors.textSecondary
        : isPositive
            ? theme.custom.colors.error
            : theme.custom.colors.success;

    const icon = isNeutral ? 'minus' : isPositive ? 'arrow-up' : 'arrow-down';

    if (compact) {
        return (
            <View style={[styles.compactContainer, { backgroundColor: color + '20' }]}>
                <MaterialCommunityIcons name={icon} size={12} color={color} />
                <Text style={[styles.compactText, { color }]}>
                    {Math.abs(value).toFixed(0)}%
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MaterialCommunityIcons name={icon} size={16} color={color} />
            <Text style={[styles.text, theme.custom.typography.caption, { color }]}>
                {isPositive ? '+' : ''}{value.toFixed(1)}%
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    text: {
        fontWeight: '600',
    },
    compactContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        gap: 2,
    },
    compactText: {
        fontSize: 11,
        fontWeight: '600',
    },
});
