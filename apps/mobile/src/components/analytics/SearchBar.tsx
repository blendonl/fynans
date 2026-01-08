import React, { useState, useMemo } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Text,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../theme';

export type SearchFilterType = 'expenseCategory' | 'itemCategory' | 'itemName' | 'family' | 'member';

export interface SearchFilter {
    type: SearchFilterType;
    id: string;
    name: string;
    familyId?: string;
}

interface SearchBarProps {
    expenseCategories: Array<{ id: string; name: string }>;
    itemCategories: Array<{ id: string; name: string }>;
    itemNames: Array<{ id: string; name: string }>;
    families: Array<{ id: string; name: string }>;
    members: Array<{ id: string; name: string; familyId: string; familyName: string }>;
    onFilterSelect: (filter: SearchFilter | null) => void;
    selectedFilter: SearchFilter | null;
    placeholder?: string;
}

interface SearchResult extends SearchFilter {
    label: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
    expenseCategories,
    itemCategories,
    itemNames,
    families,
    members,
    onFilterSelect,
    selectedFilter,
    placeholder = 'Search categories, items, families...',
}) => {
    const { theme } = useAppTheme();
    const [searchText, setSearchText] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    const searchResults = useMemo(() => {
        if (!searchText.trim()) return [];

        const query = searchText.toLowerCase();
        const results: SearchResult[] = [];

        // Search expense categories
        expenseCategories.forEach((cat) => {
            if (cat.name.toLowerCase().includes(query)) {
                results.push({
                    type: 'expenseCategory',
                    id: cat.id,
                    name: cat.name,
                    label: `${cat.name} (Expense Category)`,
                });
            }
        });

        // Search item categories
        itemCategories.forEach((cat) => {
            if (cat.name.toLowerCase().includes(query)) {
                results.push({
                    type: 'itemCategory',
                    id: cat.id,
                    name: cat.name,
                    label: `${cat.name} (Item Category)`,
                });
            }
        });

        // Search item names
        itemNames.forEach((item) => {
            if (item.name.toLowerCase().includes(query)) {
                results.push({
                    type: 'itemName',
                    id: item.id,
                    name: item.name,
                    label: `${item.name} (Item)`,
                });
            }
        });

        // Search families (include "Personal" as pseudo-family)
        if ('personal'.includes(query)) {
            results.push({
                type: 'family',
                id: 'PERSONAL',
                name: 'Personal',
                label: 'Personal (Scope)',
            });
        }

        families.forEach((family) => {
            if (family.name.toLowerCase().includes(query)) {
                results.push({
                    type: 'family',
                    id: family.id,
                    name: family.name,
                    label: `${family.name} (Family)`,
                });
            }
        });

        // Search members
        members.forEach((member) => {
            if (member.name.toLowerCase().includes(query)) {
                results.push({
                    type: 'member',
                    id: member.id,
                    name: member.name,
                    familyId: member.familyId,
                    label: `${member.name} (${member.familyName})`,
                });
            }
        });

        return results.slice(0, 10);
    }, [searchText, expenseCategories, itemCategories, itemNames, families, members]);

    const handleFilterSelect = (filter: SearchResult) => {
        setSearchText('');
        setShowSuggestions(false);
        onFilterSelect({
            type: filter.type,
            id: filter.id,
            name: filter.name,
            familyId: filter.familyId,
        });
    };

    const handleClear = () => {
        setSearchText('');
        setShowSuggestions(false);
        onFilterSelect(null);
    };

    const getFilterIcon = (type: SearchFilterType) => {
        switch (type) {
            case 'expenseCategory':
                return 'tag-outline';
            case 'itemCategory':
                return 'shape-outline';
            case 'itemName':
                return 'package-variant';
            case 'family':
                return 'account-group';
            case 'member':
                return 'account';
            default:
                return 'tag-outline';
        }
    };

    const getFilterTypeLabel = (type: SearchFilterType) => {
        switch (type) {
            case 'expenseCategory':
                return 'Expense Category';
            case 'itemCategory':
                return 'Item Category';
            case 'itemName':
                return 'Item';
            case 'family':
                return 'Family';
            case 'member':
                return 'Member';
            default:
                return 'Filter';
        }
    };

    return (
        <View style={styles.container}>
            <View
                style={[
                    styles.searchContainer,
                    {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.custom.colors.border,
                    },
                ]}
            >
                <MaterialCommunityIcons
                    name="magnify"
                    size={20}
                    color={theme.custom.colors.textSecondary}
                />
                <TextInput
                    style={[
                        styles.input,
                        theme.custom.typography.body,
                        { color: theme.custom.colors.text },
                    ]}
                    placeholder={placeholder}
                    placeholderTextColor={theme.custom.colors.textSecondary}
                    value={searchText}
                    onChangeText={(text) => {
                        setSearchText(text);
                        setShowSuggestions(text.length > 0);
                    }}
                    onFocus={() => setShowSuggestions(searchText.length > 0)}
                />
                {(searchText.length > 0 || selectedFilter) && (
                    <TouchableOpacity onPress={handleClear}>
                        <MaterialCommunityIcons
                            name="close-circle"
                            size={20}
                            color={theme.custom.colors.textSecondary}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {selectedFilter && (
                <View style={styles.chipContainer}>
                    <View
                        style={[
                            styles.chip,
                            { backgroundColor: theme.colors.primary + '20' },
                        ]}
                    >
                        <MaterialCommunityIcons
                            name={getFilterIcon(selectedFilter.type)}
                            size={14}
                            color={theme.colors.primary}
                        />
                        <Text
                            style={[
                                styles.chipText,
                                theme.custom.typography.caption,
                                { color: theme.colors.primary },
                            ]}
                        >
                            {selectedFilter.name}
                        </Text>
                        <Text
                            style={[
                                styles.chipType,
                                theme.custom.typography.caption,
                                { color: theme.colors.primary },
                            ]}
                        >
                            ({getFilterTypeLabel(selectedFilter.type)})
                        </Text>
                        <TouchableOpacity onPress={handleClear}>
                            <MaterialCommunityIcons
                                name="close"
                                size={16}
                                color={theme.colors.primary}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {showSuggestions && searchResults.length > 0 && (
                <ScrollView
                    style={[
                        styles.suggestionsContainer,
                        {
                            backgroundColor: theme.colors.surface,
                            borderColor: theme.custom.colors.border,
                        },
                    ]}
                    nestedScrollEnabled
                    keyboardShouldPersistTaps="handled"
                >
                    {searchResults.map((item) => (
                        <TouchableOpacity
                            key={item.type === 'member' ? `${item.type}-${item.id}-${item.familyId}` : `${item.type}-${item.id}`}
                            style={[
                                styles.suggestionItem,
                                { borderBottomColor: theme.custom.colors.border },
                            ]}
                            onPress={() => handleFilterSelect(item)}
                        >
                            <MaterialCommunityIcons
                                name={getFilterIcon(item.type)}
                                size={18}
                                color={theme.custom.colors.textSecondary}
                            />
                            <View style={styles.suggestionContent}>
                                <Text
                                    style={[
                                        styles.suggestionText,
                                        theme.custom.typography.body,
                                        { color: theme.custom.colors.text },
                                    ]}
                                >
                                    {item.name}
                                </Text>
                                <Text
                                    style={[
                                        styles.suggestionType,
                                        theme.custom.typography.caption,
                                        { color: theme.custom.colors.textSecondary },
                                    ]}
                                >
                                    {getFilterTypeLabel(item.type)}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        zIndex: 1000,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        gap: 8,
    },
    input: {
        flex: 1,
        padding: 0,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
        gap: 8,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 4,
    },
    chipText: {
        fontWeight: '600',
    },
    chipType: {
        fontStyle: 'italic',
    },
    suggestionsContainer: {
        position: 'absolute',
        top: 50,
        left: 0,
        right: 0,
        borderRadius: 12,
        borderWidth: 1,
        maxHeight: 240,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        gap: 10,
        borderBottomWidth: 1,
    },
    suggestionContent: {
        flex: 1,
    },
    suggestionText: {
        marginBottom: 2,
    },
    suggestionType: {},
});
