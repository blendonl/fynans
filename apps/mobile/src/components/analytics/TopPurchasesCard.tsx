import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from '../design-system';
import { useAppTheme } from '../../theme';

export interface TopPurchaseItem {
    name: string;
    category: string;
    frequency: number;
    totalSpent: number;
}

type SortBy = 'frequency' | 'totalSpent';

interface TopPurchasesCardProps {
    items: TopPurchaseItem[];
    initialMaxItems?: number;
}

export const TopPurchasesCard: React.FC<TopPurchasesCardProps> = ({
    items,
    initialMaxItems = 5,
}) => {
    const { theme } = useAppTheme();
    const [sortBy, setSortBy] = useState<SortBy>('frequency');
    const [expanded, setExpanded] = useState(false);

    const sortedItems = useMemo(() => {
        return [...items].sort((a, b) =>
            sortBy === 'frequency' ? b.frequency - a.frequency : b.totalSpent - a.totalSpent
        );
    }, [items, sortBy]);

    const displayItems = expanded ? sortedItems : sortedItems.slice(0, initialMaxItems);
    const hasMore = sortedItems.length > initialMaxItems;

    if (sortedItems.length === 0) {
        return null;
    }

    const toggleSort = () => {
        setSortBy((prev) => (prev === 'frequency' ? 'totalSpent' : 'frequency'));
    };

    const renderItem = ({ item, index }: { item: TopPurchaseItem; index: number }) => {
        const isFirst = index === 0;
        const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
        const medalColor = index < 3 ? medalColors[index] : theme.colors.primary;

        return (
            <View
                style={[
                    styles.itemContainer,
                    {
                        borderBottomColor: theme.custom.colors.border,
                        borderBottomWidth: index < displayItems.length - 1 ? 1 : 0,
                    },
                ]}
            >
                <View style={styles.itemLeft}>
                    <View
                        style={[
                            styles.rankBadge,
                            {
                                backgroundColor: medalColor + '20',
                            },
                        ]}
                    >
                        {index < 3 ? (
                            <MaterialCommunityIcons name="medal" size={20} color={medalColor} />
                        ) : (
                            <Text
                                style={[
                                    styles.rankText,
                                    theme.custom.typography.caption,
                                    { color: medalColor },
                                ]}
                            >
                                {index + 1}
                            </Text>
                        )}
                    </View>
                    <View style={styles.itemInfo}>
                        <Text
                            style={[
                                styles.itemName,
                                theme.custom.typography.body,
                                { color: theme.custom.colors.text },
                                isFirst && styles.firstItemName,
                            ]}
                            numberOfLines={1}
                        >
                            {item.name}
                        </Text>
                        <Text
                            style={[
                                styles.itemCategory,
                                theme.custom.typography.caption,
                                { color: theme.custom.colors.textSecondary },
                            ]}
                        >
                            {item.frequency}x purchased • ${item.totalSpent.toFixed(2)}
                        </Text>
                    </View>
                </View>
                <View style={styles.itemRight}>
                    <Text
                        style={[
                            styles.itemAmount,
                            theme.custom.typography.h5,
                            { color: theme.custom.colors.text },
                            isFirst && styles.firstItemAmount,
                        ]}
                    >
                        {sortBy === 'frequency' ? `${item.frequency}x` : `$${item.totalSpent.toFixed(2)}`}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <Card style={styles.card} elevation={2}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <MaterialCommunityIcons
                        name="trophy"
                        size={24}
                        color={theme.colors.primary}
                    />
                    <Text
                        style={[
                            styles.title,
                            theme.custom.typography.h5,
                            { color: theme.custom.colors.text },
                        ]}
                    >
                        Top Purchases
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={toggleSort}
                    style={[
                        styles.sortToggle,
                        { backgroundColor: theme.colors.primary + '15' },
                    ]}
                >
                    <MaterialCommunityIcons
                        name={sortBy === 'frequency' ? 'sort-numeric-descending' : 'currency-usd'}
                        size={14}
                        color={theme.colors.primary}
                    />
                    <Text
                        style={[
                            styles.sortToggleText,
                            theme.custom.typography.caption,
                            { color: theme.colors.primary },
                        ]}
                    >
                        {sortBy === 'frequency' ? 'By Frequency' : 'By Amount'}
                    </Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={displayItems}
                renderItem={renderItem}
                keyExtractor={(item, index) => `${item.name}-${index}`}
                scrollEnabled={false}
            />
            {hasMore && (
                <TouchableOpacity
                    onPress={() => setExpanded(!expanded)}
                    style={[
                        styles.showMoreButton,
                        { borderTopColor: theme.custom.colors.border },
                    ]}
                >
                    <Text
                        style={[
                            styles.showMoreText,
                            theme.custom.typography.caption,
                            { color: theme.colors.primary },
                        ]}
                    >
                        {expanded ? 'Show Less' : `Show ${sortedItems.length - initialMaxItems} More`}
                    </Text>
                    <MaterialCommunityIcons
                        name={expanded ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color={theme.colors.primary}
                    />
                </TouchableOpacity>
            )}
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        margin: 16,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    title: {
        fontWeight: '600',
    },
    sortToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 4,
    },
    sortToggleText: {
        fontWeight: '600',
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    itemRight: {
        alignItems: 'flex-end',
        marginLeft: 8,
    },
    rankBadge: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rankText: {
        fontWeight: 'bold',
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        marginBottom: 2,
    },
    firstItemName: {
        fontWeight: '600',
        fontSize: 16,
    },
    itemCategory: {},
    itemAmount: {
        fontWeight: '600',
    },
    firstItemAmount: {
        fontSize: 18,
    },
    showMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 12,
        marginTop: 8,
        borderTopWidth: 1,
        gap: 4,
    },
    showMoreText: {
        fontWeight: '600',
    },
});
