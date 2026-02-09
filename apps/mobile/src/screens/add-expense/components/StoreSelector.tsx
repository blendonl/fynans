import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Store } from "../../../features/expenses/types";
import { Input, Card, Dropdown, DropdownItem } from "../../../components/design-system";
import { useAppTheme } from "../../../theme";

interface StoreSelectorProps {
  storeInput: string;
  selectedStore: Store | null;
  stores: Store[];
  showDropdown: boolean;
  onInputChange: (text: string) => void;
  onStoreSelect: (store: Store) => void;
  onAddNew: () => void;
  onClear: () => void;
  onFocus: () => void;
}

export function StoreSelector({
  storeInput,
  selectedStore,
  stores,
  showDropdown,
  onInputChange,
  onStoreSelect,
  onAddNew,
  onClear,
  onFocus,
}: StoreSelectorProps) {
  const { theme } = useAppTheme();

  const dropdownItems: DropdownItem[] = stores.map((store) => ({
    id: store.id,
    label: store.name,
    subtitle: store.location,
  }));

  const handleDropdownSelect = (item: DropdownItem) => {
    const store = stores.find((s) => s.id === item.id);
    if (store) {
      onStoreSelect(store);
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
        Store Information
      </Text>

      {selectedStore && !showDropdown ? (
        <Card style={styles.selectedCard} elevation={1}>
          <View style={styles.selectedContent}>
            <View style={styles.storeInfo}>
              <Text
                style={[
                  styles.storeName,
                  theme.custom.typography.bodyMedium,
                  { color: theme.custom.colors.text },
                ]}
              >
                {selectedStore.name}
              </Text>
              <Text
                style={[
                  styles.storeLocation,
                  theme.custom.typography.caption,
                  { color: theme.custom.colors.textSecondary },
                ]}
              >
                {selectedStore.location}
              </Text>
            </View>
            <TouchableOpacity onPress={onClear} style={styles.clearButton}>
              <MaterialCommunityIcons
                name="close"
                size={20}
                color={theme.custom.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </Card>
      ) : (
        <Input
          placeholder="Search or select a store"
          value={storeInput}
          onChangeText={onInputChange}
          onFocus={onFocus}
          leftIcon="store"
        />
      )}

      <Dropdown
        items={dropdownItems}
        visible={showDropdown}
        onSelect={handleDropdownSelect}
        onCreate={onAddNew}
        createLabel="+ Add new store"
        showCreateOption={storeInput.trim() !== "" && !stores.some(s => s.name.toLowerCase() === storeInput.toLowerCase())}
        emptyMessage="No stores found"
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
  selectedCard: {
    marginTop: 8,
  },
  selectedContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {},
  storeLocation: {
    marginTop: 2,
  },
  clearButton: {
    padding: 8,
  },
});
