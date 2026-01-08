import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    ViewStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../theme';
import { createGlassStyles } from '../../theme/glassStyles';
import { animations } from '../../theme/animations';

export interface ToggleOption {
    value: string;
    label: string;
    icon?: string;
    color?: string;
}

interface ToggleSwitchProps {
    options?: ToggleOption[];
    value?: string | boolean;
    onChange?: (value: string) => void;
    onValueChange?: (value: boolean) => void;
    label?: string;
    style?: ViewStyle;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
    options,
    value,
    onChange,
    onValueChange,
    label,
    style,
}) => {
    const { theme } = useAppTheme();
    const glassStyles = createGlassStyles(theme.custom.colors);
    const slideAnim = useRef(new Animated.Value(0)).current;
    const [containerWidth, setContainerWidth] = React.useState(0);

    // Handle boolean toggle mode
    if (!options && label && typeof value === 'boolean' && onValueChange) {
        return (
            <TouchableOpacity
                style={[glassStyles.glassCard, styles.booleanContainer, style]}
                onPress={() => onValueChange(!value)}
                activeOpacity={0.7}
            >
                <Text
                    style={[
                        theme.custom.typography.bodyMedium,
                        { color: theme.custom.colors.text, flex: 1 },
                    ]}
                >
                    {label}
                </Text>
                <View
                    style={[
                        styles.switch,
                        {
                            backgroundColor: value
                                ? theme.colors.primary
                                : theme.custom.colors.border,
                        },
                    ]}
                >
                    <Animated.View
                        style={[
                            styles.switchThumb,
                            {
                                transform: [{ translateX: value ? 20 : 2 }],
                            },
                        ]}
                    />
                </View>
            </TouchableOpacity>
        );
    }

    // Handle multi-option toggle mode
    if (!options || !onChange || typeof value !== 'string') {
        return null;
    }

    const selectedIndex = options.findIndex((opt) => opt.value === value);

    useEffect(() => {
        Animated.spring(slideAnim, {
            toValue: selectedIndex,
            ...animations.spring,
        }).start();
    }, [selectedIndex]);

    const getOptionColor = (option: ToggleOption) => {
        if (option.value === 'EXPENSE') {
            return theme.custom.colors.expense;
        } else if (option.value === 'INCOME') {
            return theme.custom.colors.income;
        }
        return theme.colors.primary;
    };

    const padding = 4;
    const optionWidthPercent = 100 / options.length;
    const optionWidthPx = (containerWidth - padding * 2) / options.length;

    return (
        <View
            style={[glassStyles.glassCard, styles.container, style]}
            onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
        >
            {/* Animated indicator */}
            <Animated.View
                style={[
                    styles.indicator,
                    {
                        backgroundColor: getOptionColor(options[selectedIndex]),
                        width: `${optionWidthPercent}%`,
                        transform: [
                            {
                                translateX: slideAnim.interpolate({
                                    inputRange: options.map((_, i) => i),
                                    outputRange: options.map((_, i) => i * optionWidthPx),
                                }),
                            },
                        ],
                    },
                ]}
            />

            {/* Options */}
            {options.map((option, index) => {
                const isSelected = option.value === value;
                const optionColor = getOptionColor(option);

                return (
                    <TouchableOpacity
                        key={option.value}
                        style={[styles.option, { width: `${optionWidthPercent}%` }]}
                        onPress={() => onChange(option.value)}
                        activeOpacity={0.7}
                    >
                        {option.icon && (
                            <MaterialCommunityIcons
                                name={option.icon as any}
                                size={20}
                                color={isSelected ? '#FFFFFF' : theme.custom.colors.textSecondary}
                                style={styles.icon}
                            />
                        )}
                        <Text
                            style={[
                                styles.optionText,
                                theme.custom.typography.bodyMedium,
                                {
                                    color: isSelected ? '#FFFFFF' : theme.custom.colors.text,
                                    fontWeight: isSelected ? '600' : '400',
                                },
                            ]}
                        >
                            {option.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        position: 'relative',
        padding: 4,
        overflow: 'hidden',
    },
    indicator: {
        position: 'absolute',
        top: 4,
        left: 4,
        bottom: 4,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        zIndex: 1,
    },
    icon: {
        marginRight: 6,
    },
    optionText: {
        fontSize: 15,
    },
    booleanContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    switch: {
        width: 48,
        height: 28,
        borderRadius: 14,
        padding: 2,
        justifyContent: 'center',
    },
    switchThumb: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
});
