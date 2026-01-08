import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Animated,
    ViewStyle,
} from 'react-native';
import { useAppTheme } from '../../theme';
import { createGlassStyles } from '../../theme/glassStyles';
import { animations } from '../../theme/animations';

export interface DropdownItem {
    id: string;
    label: string;
    subtitle?: string;
    icon?: string;
}

interface DropdownProps {
    items: DropdownItem[];
    visible: boolean;
    loading?: boolean;
    onSelect: (item: DropdownItem) => void;
    onCreate?: () => void;
    createLabel?: string;
    showCreateOption?: boolean;
    emptyMessage?: string;
    maxHeight?: number;
    style?: ViewStyle;
    renderItem?: (item: DropdownItem) => React.ReactNode;
}

export const Dropdown: React.FC<DropdownProps> = ({
    items,
    visible,
    loading = false,
    onSelect,
    onCreate,
    createLabel,
    showCreateOption = false,
    emptyMessage = 'No items found',
    maxHeight = 200,
    style,
    renderItem,
}) => {
    const { theme } = useAppTheme();
    const glassStyles = createGlassStyles(theme.custom.colors);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: animations.duration.fast,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    ...animations.spring,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: animations.duration.fast,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 0.95,
                    duration: animations.duration.fast,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    if (!visible) return null;

    const defaultRenderItem = (item: DropdownItem) => (
        <TouchableOpacity
            style={[
                styles.dropdownItem,
                { borderBottomColor: theme.custom.colors.divider },
            ]}
            onPress={() => onSelect(item)}
            activeOpacity={0.7}
        >
            <View style={styles.itemContent}>
                <Text
                    style={[
                        styles.itemText,
                        theme.custom.typography.body,
                        { color: theme.custom.colors.text },
                    ]}
                >
                    {item.label}
                </Text>
                {item.subtitle && (
                    <Text
                        style={[
                            styles.itemSubtitle,
                            theme.custom.typography.caption,
                            { color: theme.custom.colors.textSecondary },
                        ]}
                    >
                        {item.subtitle}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <Animated.View
            style={[
                glassStyles.glassDropdown,
                styles.dropdown,
                { maxHeight, opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
                style,
            ]}
        >
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                </View>
            ) : (
                <>
                    {items.length > 0 ? (
                        <ScrollView
                            style={[styles.list, { maxHeight }]}
                            nestedScrollEnabled
                            showsVerticalScrollIndicator={true}
                            keyboardShouldPersistTaps="handled"
                        >
                            {items.map((item) => (
                                <View key={item.id}>
                                    {renderItem ? renderItem(item) : defaultRenderItem(item)}
                                </View>
                            ))}
                        </ScrollView>
                    ) : (
                        <Text
                            style={[
                                styles.emptyText,
                                theme.custom.typography.body,
                                { color: theme.custom.colors.textSecondary },
                            ]}
                        >
                            {emptyMessage}
                        </Text>
                    )}

                    {showCreateOption && onCreate && createLabel && (
                        <TouchableOpacity
                            style={[
                                styles.dropdownItem,
                                styles.createOption,
                                {
                                    backgroundColor: theme.custom.colors.selectionBackground,
                                    borderTopColor: theme.colors.primary,
                                },
                            ]}
                            onPress={onCreate}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[
                                    styles.createText,
                                    theme.custom.typography.bodyMedium,
                                    { color: theme.colors.primary },
                                ]}
                            >
                                {createLabel}
                            </Text>
                        </TouchableOpacity>
                    )}
                </>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    dropdown: {
        marginTop: 8,
        overflow: 'hidden',
    },
    list: {
        flexGrow: 0,
    },
    loadingContainer: {
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dropdownItem: {
        padding: 12,
        borderBottomWidth: 1,
    },
    itemContent: {
        flex: 1,
    },
    itemText: {
        fontSize: 16,
    },
    itemSubtitle: {
        marginTop: 4,
        fontSize: 14,
    },
    emptyText: {
        padding: 16,
        textAlign: 'center',
    },
    createOption: {
        borderTopWidth: 2,
        borderBottomWidth: 0,
    },
    createText: {
        fontWeight: '600',
    },
});
