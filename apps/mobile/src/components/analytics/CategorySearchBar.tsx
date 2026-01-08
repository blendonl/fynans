import React, { useState } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Text,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../theme';

interface Category {
    id: string;
    name: string;
}

interface CategorySearchBarProps {
    categories: Category[];
    onCategorySelect: (category: Category | null) => void;
    selectedCategory: Category | null;
    placeholder?: string;
}

export const CategorySearchBar: React.FC<CategorySearchBarProps> = ({
    categories,
    onCategorySelect,
    selectedCategory,
    placeholder = 'Search categories...',
}) => {
    const { theme } = useAppTheme();
    const [searchText, setSearchText] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    const filteredCategories = categories.filter((cat) =>
        cat.name.toLowerCase().includes(searchText.toLowerCase())
    );

    const handleCategorySelect = (category: Category) => {
        setSearchText('');
        setShowSuggestions(false);
        onCategorySelect(category);
    };

    const handleClear = () => {
        setSearchText('');
        setShowSuggestions(false);
        onCategorySelect(null);
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
                {(searchText.length > 0 || selectedCategory) && (
                    <TouchableOpacity onPress={handleClear}>
                        <MaterialCommunityIcons
                            name="close-circle"
                            size={20}
                            color={theme.custom.colors.textSecondary}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {selectedCategory && (
                <View style={styles.chipContainer}>
                    <View
                        style={[
                            styles.chip,
                            { backgroundColor: theme.colors.primary + '20' },
                        ]}
                    >
                        <Text
                            style={[
                                styles.chipText,
                                theme.custom.typography.caption,
                                { color: theme.colors.primary },
                            ]}
                        >
                            {selectedCategory.name}
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

            {showSuggestions && filteredCategories.length > 0 && (
                <View
                    style={[
                        styles.suggestionsContainer,
                        {
                            backgroundColor: theme.colors.surface,
                            borderColor: theme.custom.colors.border,
                        },
                    ]}
                >
                    <FlatList
                        data={filteredCategories.slice(0, 5)}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.suggestionItem,
                                    { borderBottomColor: theme.custom.colors.border },
                                ]}
                                onPress={() => handleCategorySelect(item)}
                            >
                                <MaterialCommunityIcons
                                    name="tag-outline"
                                    size={18}
                                    color={theme.custom.colors.textSecondary}
                                />
                                <Text
                                    style={[
                                        styles.suggestionText,
                                        theme.custom.typography.body,
                                        { color: theme.custom.colors.text },
                                    ]}
                                >
                                    {item.name}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
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
        gap: 6,
    },
    chipText: {
        fontWeight: '600',
    },
    suggestionsContainer: {
        position: 'absolute',
        top: 50,
        left: 0,
        right: 0,
        borderRadius: 12,
        borderWidth: 1,
        maxHeight: 200,
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
    suggestionText: {},
});
