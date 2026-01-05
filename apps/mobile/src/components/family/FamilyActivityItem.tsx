import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '../../theme';

interface FamilyActivityItemProps {
    type: 'INCOME' | 'EXPENSE';
    description: string;
    memberName: string;
    amount: number;
    timestamp: string;
    categoryIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
    onPress?: () => void;
}

const getRelativeTime = (timestamp: string): string => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
};

export const FamilyActivityItem: React.FC<FamilyActivityItemProps> = ({
    type,
    description,
    memberName,
    amount,
    timestamp,
    categoryIcon = 'cash',
    onPress,
}) => {
    const { theme } = useAppTheme();

    const isIncome = type === 'INCOME';
    const amountColor = isIncome
        ? theme.custom.colors.income
        : theme.custom.colors.expense;
    const iconBgColor = isIncome
        ? theme.custom.colors.incomeLight + '20'
        : theme.custom.colors.expenseLight + '20';

    // Animations
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    React.useEffect(() => {
        // Entrance animation
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
    }, []);

    const handlePressIn = () => {
        if (onPress) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Animated.spring(scaleAnim, {
                toValue: 0.98,
                useNativeDriver: true,
                tension: 300,
                friction: 20,
            }).start();
        }
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 300,
            friction: 20,
        }).start();
    };

    const Container = onPress ? TouchableOpacity : View;

    return (
        <Animated.View
            style={[
                {
                    opacity: fadeAnim,
                    transform: [
                        { scale: scaleAnim },
                        { translateY: slideAnim },
                    ],
                },
            ]}
        >
            <Container
                style={[
                    styles.container,
                    {
                        borderRadius: theme.custom.borderRadius.md,
                        padding: theme.custom.spacing.md,
                        marginBottom: theme.custom.spacing.sm,
                        minHeight: 72,
                        overflow: 'hidden',
                        borderLeftWidth: 4,
                        borderLeftColor: amountColor,
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
                {/* BlurView background */}
                <BlurView
                    intensity={Platform.OS === 'ios' ? 20 : 15}
                    tint={theme.dark ? 'dark' : 'light'}
                    style={StyleSheet.absoluteFill}
                />

                {/* Diagonal gradient overlay */}
                <LinearGradient
                    colors={[
                        `${theme.colors.surface}E6`,
                        `${theme.colors.surface}CC`,
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />

                {/* Circular icon container with gradient */}
                <View
                    style={[
                        styles.iconContainer,
                        {
                            borderRadius: theme.custom.borderRadius.round,
                            marginRight: theme.custom.spacing.md,
                            overflow: 'hidden',
                            ...Platform.select({
                                ios: {
                                    shadowColor: amountColor,
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
                        colors={[
                            `${amountColor}28`,
                            `${amountColor}18`,
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFill}
                    />
                    <MaterialCommunityIcons
                        name={categoryIcon}
                        size={24}
                        color={amountColor}
                    />
                </View>

                <View style={styles.contentContainer}>
                    <Text
                        style={[
                            styles.description,
                            theme.custom.typography.bodyMedium,
                            { color: theme.colors.onSurface },
                        ]}
                        numberOfLines={1}
                    >
                        {description}
                    </Text>
                    <View style={styles.metaRow}>
                        <Text
                            style={[
                                styles.memberName,
                                theme.custom.typography.small,
                                { color: theme.custom.colors.textSecondary },
                            ]}
                        >
                            {memberName}
                        </Text>
                        <Text
                            style={[
                                styles.timestamp,
                                theme.custom.typography.small,
                                { color: theme.custom.colors.textDisabled },
                            ]}
                        >
                            • {getRelativeTime(timestamp)}
                        </Text>
                    </View>
                </View>

                <Text
                    style={[
                        styles.amount,
                        theme.custom.typography.h5,
                        {
                            color: amountColor,
                            fontWeight: '700',
                        },
                    ]}
                >
                    {isIncome ? '+' : '-'}${Math.abs(amount).toFixed(2)}
                </Text>
            </Container>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
    contentContainer: {
        flex: 1,
        marginRight: 12,
    },
    description: {
        fontWeight: '600',
        marginBottom: 4,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    memberName: {
        marginRight: 4,
    },
    timestamp: {},
    amount: {
        fontWeight: '700',
    },
});

export default FamilyActivityItem;
