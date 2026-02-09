import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Category } from "../../../features/expenses/types";
import { Input, Chip, Dropdown, DropdownItem } from "../../../components/design-system";
import { useAppTheme } from "../../../theme";

interface CategorySelectorProps {
  categoryInput: string;
  selectedCategory: Category | null;
  filteredCategories: Category[];
  showDropdown: boolean;
  loading: boolean;
  onInputChange: (text: string) => void;
  onCategorySelect: (category: Category) => void;
  onCreateNew: () => void;
  onClear: () => void;
  onFocus: () => void;
}

export function CategorySelector({
  categoryInput,
  selectedCategory,
  filteredCategories,
  showDropdown,
  loading,
  onInputChange,
  onCategorySelect,
  onCreateNew,
  onClear,
  onFocus,
}: CategorySelectorProps) {
  const { theme } = useAppTheme();
  const hasExactMatch = filteredCategories.some(
    (cat) => cat.name.toLowerCase() === categoryInput.toLowerCase(),
  );
  const showCreateOption = categoryInput.trim() !== "" && !hasExactMatch;

  const dropdownItems: DropdownItem[] = filteredCategories.map((cat) => ({
    id: cat.id,
    label: cat.name,
  }));

  const handleDropdownSelect = (item: DropdownItem) => {
    const category = filteredCategories.find((cat) => cat.id === item.id);
    if (category) {
      onCategorySelect(category);
    }
  };

  return (
    <View style={styles.section}>
      <Text
        style={[
          styles.sectionTitle,
          theme.custom.typography.h5,
          { color: theme.custom.colors.text },
        ]}
      >
        Expense Category
      </Text>

      {selectedCategory && !showDropdown ? (
        <View style={styles.selectedContainer}>
          <Chip
            label={selectedCategory.name}
            selected={true}
            onClose={onClear}
            style={styles.selectedChip}
          />
        </View>
      ) : (
        <Input
          placeholder="Type or select a category"
          value={categoryInput}
          onChangeText={onInputChange}
          onFocus={onFocus}
          leftIcon="tag"
        />
      )}

      <Dropdown
        items={dropdownItems}
        visible={showDropdown}
        loading={loading}
        onSelect={handleDropdownSelect}
        onCreate={onCreateNew}
        createLabel={`+ Create new category: "${categoryInput}"`}
        showCreateOption={showCreateOption}
        emptyMessage="No matching categories"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  selectedContainer: {
    marginTop: 8,
  },
  selectedChip: {
    alignSelf: 'flex-start',
  },
});
