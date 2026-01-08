import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useAppTheme } from '../../theme';

interface CircularProgressProps {
    percentage: number;
    size?: number;
    strokeWidth?: number;
    title: string;
    subtitle?: string;
    color?: string;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const CircularProgress: React.FC<CircularProgressProps> = ({
    percentage,
    size = 200,
    strokeWidth = 12,
    title,
    subtitle,
    color,
}) => {
    const { theme } = useAppTheme();
    const animatedValue = useRef(new Animated.Value(0)).current;

    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    // Determine color based on percentage if not provided
    const getColor = () => {
        if (color) return color;
        if (percentage <= 50) return theme.custom.colors.success;
        if (percentage <= 75) return '#FFA500'; // Orange
        return theme.custom.colors.error;
    };

    const progressColor = getColor();

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: percentage,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    }, [percentage]);

    const strokeDashoffset = animatedValue.interpolate({
        inputRange: [0, 100],
        outputRange: [circumference, 0],
    });

    return (
        <View style={styles.container}>
            <Svg width={size} height={size}>
                <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
                    {/* Background Circle */}
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={theme.custom.colors.border}
                        strokeWidth={strokeWidth}
                        fill="none"
                        opacity={0.2}
                    />
                    {/* Progress Circle */}
                    <AnimatedCircle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={progressColor}
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                    />
                </G>
            </Svg>

            <View style={styles.textContainer}>
                <Text
                    style={[
                        styles.percentage,
                        theme.custom.typography.h1,
                        { color: progressColor },
                    ]}
                >
                    {Math.round(percentage)}%
                </Text>
                <Text
                    style={[
                        styles.title,
                        theme.custom.typography.body,
                        { color: theme.custom.colors.text },
                    ]}
                >
                    {title}
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
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        position: 'absolute',
        alignItems: 'center',
    },
    percentage: {
        fontWeight: 'bold',
    },
    title: {
        marginTop: 4,
        textAlign: 'center',
    },
    subtitle: {
        marginTop: 2,
        textAlign: 'center',
    },
});
