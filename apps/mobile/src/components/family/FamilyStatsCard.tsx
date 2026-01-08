import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '../../theme';
import { Card } from '../design-system';

interface StatItem {
    label: string;
    value: string | number;
    icon?: keyof typeof MaterialCommunityIcons.glyphMap;
    color?: string;
    valueColor?: string;
}

interface FamilyStatsCardProps {
    stats: StatItem[];
    columns?: 2 | 3 | 4;
}

// Count-up animation component for numbers
const AnimatedValue: React.FC<{ value: number; color: string; style: any }> = ({ value, color, style }) => {
    const animatedValue = useRef(new Animated.Value(0)).current;
    const displayValue = useRef(0);
    const [currentValue, setCurrentValue] = React.useState(0);

    useEffect(() => {
        animatedValue.addListener(({ value: v }) => {
            displayValue.current = v;
            setCurrentValue(Math.round(v));
        });

        Animated.timing(animatedValue, {
            toValue: value,
            duration: 800,
            useNativeDriver: false,
        }).start();

        return () => {
            animatedValue.removeAllListeners();
        };
    }, [value]);

    return (
        <Text style={[style, { color }]}>
            {currentValue}
        </Text>
    );
};

// Stat item component to avoid hooks in loops
const StatItem: React.FC<{ stat: StatItem; index: number; columns: number; theme: any }> = ({ stat, index, columns, theme }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Animated.spring(scaleAnim, {
            toValue: 0.95,
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

    const isNumberValue = typeof stat.value === 'number';

    return (
        <Animated.View
            key={index}
            style={[
                { flex: 1, minWidth: `${100 / columns - 5}%` },
                { transform: [{ scale: scaleAnim }] },
            ]}
        >
            <TouchableOpacity
                style={[
                    styles.statItem,
                    {
                        padding: theme.custom.spacing.md,
                        borderRadius: theme.custom.borderRadius.lg,
                        backgroundColor: theme.colors.surface,
                        borderWidth: 1,
                        borderColor: theme.custom.colors.border,
                        ...Platform.select({
                            ios: {
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.05,
                                shadowRadius: 2,
                            },
                            android: {
                                elevation: 1,
                            },
                        }),
                    },
                ]}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.7}
            >

                {stat.icon && (
                    <View
                        style={[
                            styles.iconContainer,
                            {
                                backgroundColor: stat.color
                                    ? `${stat.color}15`
                                    : `${theme.colors.primary}15`,
                                borderRadius: theme.custom.borderRadius.lg,
                                marginBottom: theme.custom.spacing.sm,
                            },
                        ]}
                    >
                        <MaterialCommunityIcons
                            name={stat.icon}
                            size={24}
                            color={stat.color || theme.colors.primary}
                        />
                    </View>
                )}
                <Text
                    style={[
                        styles.statLabel,
                        theme.custom.typography.caption,
                        { color: theme.custom.colors.textSecondary, marginBottom: theme.custom.spacing.xs },
                    ]}
                >
                    {stat.label}
                </Text>
                {isNumberValue ? (
                    <AnimatedValue
                        value={stat.value as number}
                        color={stat.valueColor || theme.colors.onSurface}
                        style={[
                            styles.statValue,
                            theme.custom.typography.h4,
                            { fontWeight: '600' },
                        ]}
                    />
                ) : (
                    <Text
                        style={[
                            styles.statValue,
                            theme.custom.typography.h4,
                            {
                                color: stat.valueColor || theme.colors.onSurface,
                                fontWeight: '600',
                            },
                        ]}
                    >
                        {stat.value}
                    </Text>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

export const FamilyStatsCard: React.FC<FamilyStatsCardProps> = ({
    stats,
    columns = 2,
}) => {
    const { theme } = useAppTheme();

    return (
        <View style={[styles.card, { padding: theme.custom.spacing.lg }]}>
            <View style={[styles.statsGrid, { gap: theme.custom.spacing.lg }]}>
                {stats.map((stat, index) => (
                    <StatItem
                        key={index}
                        stat={stat}
                        index={index}
                        columns={columns}
                        theme={theme}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {},
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    statItem: {
        alignItems: 'center',
    },
    iconContainer: {
        width: 52,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statLabel: {
        textAlign: 'center',
    },
    statValue: {
        textAlign: 'center',
    },
});

export default FamilyStatsCard;
