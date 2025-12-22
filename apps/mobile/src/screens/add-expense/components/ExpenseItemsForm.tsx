import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Category, ExpenseItem, CurrentItem, Store } from "../types";
import { Input, Button, Card, Chip } from "../../../components/design-system";
import { PriceInput } from "../../../components/forms";
import { useAppTheme } from "../../../theme";
import { apiClient } from "../../../api/client";
import { AddItemCategoryModal } from "./AddItemCategoryModal";

interface StoreItem {
  id: string;
  name: string;
  price: number;
  discount: number;
  categoryId: string;
}

interface ExpenseItemsFormProps {
  items: ExpenseItem[];
  currentItem: CurrentItem;
  itemCategories: Category[];
  selectedStore: Store | null;
  onCurrentItemChange: (item: CurrentItem) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
}

export function ExpenseItemsForm({
  items,
  currentItem,
  itemCategories,
  selectedStore,
  onCurrentItemChange,
  onAddItem,
  onRemoveItem,
}: ExpenseItemsFormProps) {
  const { theme } = useAppTheme();
  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [filteredStoreItems, setFilteredStoreItems] = useState<StoreItem[]>([]);
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [showPriceFields, setShowPriceFields] = useState(false);
  const [isExistingItem, setIsExistingItem] = useState(false);

  const [categoryInput, setCategoryInput] = useState("");
  const [selectedItemCategory, setSelectedItemCategory] =
    useState<Category | null>(null);
  const [filteredItemCategories, setFilteredItemCategories] = useState<
    Category[]
  >([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [localItemCategories, setLocalItemCategories] =
    useState<Category[]>(itemCategories);

  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedParentCategory, setSelectedParentCategory] =
    useState<Category | null>(null);
  const [categoryLoading, setCategoryLoading] = useState(false);

  useEffect(() => {
    setLocalItemCategories(itemCategories);
  }, [itemCategories]);

  useEffect(() => {
    if (selectedStore) {
      fetchStoreItems();
    }
  }, [selectedStore?.id]);

  useEffect(() => {
    if (currentItem.name.trim()) {
      const filtered = storeItems.filter((item) =>
        item.name.toLowerCase().includes(currentItem.name.toLowerCase()),
      );
      setFilteredStoreItems(filtered);
    } else {
      setFilteredStoreItems(storeItems);
      setShowPriceFields(false);
      setIsExistingItem(false);
    }
  }, [currentItem.name, storeItems]);

  useEffect(() => {
    if (categoryInput.trim()) {
      const filtered = localItemCategories.filter((cat) =>
        cat.name.toLowerCase().includes(categoryInput.toLowerCase()),
      );
      setFilteredItemCategories(filtered);
    } else {
      setFilteredItemCategories(localItemCategories);
    }
  }, [categoryInput, localItemCategories]);

  const fetchStoreItems = async () => {
    try {
      const response = await apiClient.get(
        `/stores/${selectedStore?.id}/items`,
      );

      setStoreItems(response.data);
    } catch (error) {
      console.error("Failed to fetch store items:", error);
      setStoreItems([]);
    }
  };

  const handleItemNameChange = (text: string) => {
    onCurrentItemChange({ ...currentItem, name: text });
    setShowItemDropdown(true);
    setIsExistingItem(false);

    if (text.trim()) {
      setShowPriceFields(true);
    } else {
      setShowPriceFields(false);
    }
  };

  const handleSelectStoreItem = (item: StoreItem) => {
    onCurrentItemChange({
      name: item.name,
      price: item.price.toString(),
      discount: item.discount > 0 ? item.discount.toString() : "",
      categoryId: item.categoryId,
    });

    const category = localItemCategories.find(cat => cat.id === item.categoryId);
    if (category) {
      setSelectedItemCategory(category);
      setCategoryInput(category.name);
    }

    setShowItemDropdown(false);
    setShowPriceFields(true);
    setIsExistingItem(true);
  };

  const handleCategoryInputChange = (text: string) => {
    setCategoryInput(text);
    setShowCategoryDropdown(true);

    if (text.trim() === "") {
      setSelectedItemCategory(null);
      onCurrentItemChange({ ...currentItem, categoryId: "" });
    }
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedItemCategory(category);
    setCategoryInput(category.name);
    setShowCategoryDropdown(false);
    onCurrentItemChange({ ...currentItem, categoryId: category.id });
  };

  const handleOpenCreateCategoryModal = () => {
    setNewCategoryName(categoryInput.trim());
    setShowCreateCategoryModal(true);
    setShowCategoryDropdown(false);
  };

  const handleCreateNewCategory = async () => {
    const trimmedName = newCategoryName.trim();

    if (!trimmedName) {
      Alert.alert("Error", "Please enter a category name");
      return;
    }

    try {
      setCategoryLoading(true);
      const payload: any = { name: trimmedName };
      if (selectedParentCategory) {
        payload.parentId = selectedParentCategory.id;
      }

      const response = await apiClient.post(
        "/expense-item-categories",
        payload,
      );

      const newCategory: Category = {
        id: response.data.id,
        name: response.data.name,
        isConnectedToStore: false,
      };

      setLocalItemCategories([...localItemCategories, newCategory]);
      handleCategorySelect(newCategory);
      setShowCreateCategoryModal(false);
      setNewCategoryName("");
      setSelectedParentCategory(null);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create category");
    } finally {
      setCategoryLoading(false);
    }
  };

  const clearCategorySelection = () => {
    setSelectedItemCategory(null);
    setCategoryInput("");
    setShowCategoryDropdown(true);
    onCurrentItemChange({ ...currentItem, categoryId: "" });
  };

  useEffect(() => {
    if (!currentItem.name && !currentItem.price && !currentItem.discount) {
      setShowItemDropdown(false);
      setIsExistingItem(false);
      setCategoryInput("");
      setSelectedItemCategory(null);
      setShowCategoryDropdown(false);
    }
  }, [currentItem]);

  return (
    <View style={styles.section}>
      <Text
        style={[
          styles.sectionTitle,
          theme.custom.typography.h5,
          { color: theme.custom.colors.text },
        ]}
      >
        Items
      </Text>

      {items.map((item, index) => (
        <Card key={index} style={styles.itemCard} elevation={1}>
          <View style={styles.itemContent}>
            <View style={styles.itemInfo}>
              <Text
                style={[
                  styles.itemName,
                  theme.custom.typography.bodyMedium,
                  { color: theme.custom.colors.text },
                ]}
              >
                {item.name}
              </Text>
              <Text
                style={[
                  styles.itemPrice,
                  theme.custom.typography.caption,
                  { color: theme.custom.colors.textSecondary },
                ]}
              >
                ${item.price.toFixed(2)}
                {item.discount > 0 && ` (-$${item.discount.toFixed(2)})`}
              </Text>
            </View>
            <Button
              title="Remove"
              onPress={() => onRemoveItem(index)}
              variant="text"
              style={styles.removeButton}
            />
          </View>
        </Card>
      ))}

      <View style={styles.formSection}>
        <Text
          style={[
            styles.subSectionTitle,
            theme.custom.typography.h5,
            { color: theme.custom.colors.text },
          ]}
        >
          Add New Item
        </Text>

        <View>
          <Input
            placeholder="Item name"
            value={currentItem.name}
            onChangeText={handleItemNameChange}
            onFocus={() => setShowItemDropdown(true)}
            leftIcon="cart"
          />

          {showItemDropdown && filteredStoreItems.length > 0 && (
            <View style={styles.dropdown}>
              <FlatList
                data={filteredStoreItems}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => handleSelectStoreItem(item)}
                  >
                    <Text style={styles.dropdownItemText}>{item.price}</Text>
                    <Text style={styles.dropdownItemPrice}>
                      ${item.price.toFixed(2)}
                      {item.discount > 0 && ` (-$${item.discount.toFixed(2)})`}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </View>

        {showPriceFields && (
          <>
            <PriceInput
              label="Price"
              value={currentItem.price}
              onChangeText={(text) =>
                onCurrentItemChange({ ...currentItem, price: text })
              }
              placeholder="0.00"
            />
            <PriceInput
              label="Discount (optional)"
              value={currentItem.discount}
              onChangeText={(text) =>
                onCurrentItemChange({ ...currentItem, discount: text })
              }
              placeholder="0.00"
            />

            {!isExistingItem && (
              <>
                <Text
                  style={[
                    styles.label,
                    theme.custom.typography.bodyMedium,
                    { color: theme.custom.colors.text },
                  ]}
                >
                  Item Category
                </Text>
                {selectedItemCategory && !showCategoryDropdown ? (
                  <View style={styles.selectedContainer}>
                    <Chip
                      label={selectedItemCategory.name}
                      selected={true}
                      onClose={clearCategorySelection}
                      style={styles.selectedChip}
                    />
                  </View>
                ) : (
                  <Input
                    placeholder="Type or select a category"
                    value={categoryInput}
                    onChangeText={handleCategoryInputChange}
                    onFocus={() => setShowCategoryDropdown(true)}
                    leftIcon="tag"
                  />
                )}

                {showCategoryDropdown && (
                  <View style={styles.dropdown}>
                    {filteredItemCategories.length > 0 ? (
                      <FlatList
                        data={filteredItemCategories}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={styles.dropdownItem}
                            onPress={() => handleCategorySelect(item)}
                          >
                            <Text style={styles.dropdownItemText}>
                              {item.name}
                            </Text>
                          </TouchableOpacity>
                        )}
                        style={styles.dropdownList}
                        nestedScrollEnabled
                      />
                    ) : (
                      categoryInput.trim() !== "" && (
                        <Text style={styles.noResultsText}>
                          No matching categories
                        </Text>
                      )
                    )}

                    {categoryInput.trim() !== "" &&
                      !filteredItemCategories.some(
                        (cat) =>
                          cat.name.toLowerCase() ===
                          categoryInput.toLowerCase(),
                      ) && (
                        <TouchableOpacity
                          style={[styles.dropdownItem, styles.createOption]}
                          onPress={handleOpenCreateCategoryModal}
                        >
                          <Text style={styles.createOptionText}>
                            + Create new category: "{categoryInput}"
                          </Text>
                        </TouchableOpacity>
                      )}
                  </View>
                )}
              </>
            )}
          </>
        )}

        {showPriceFields && (
          <Button
            title="Add Item"
            onPress={onAddItem}
            variant="secondary"
            fullWidth
            style={styles.addButton}
          />
        )}
      </View>

      <AddItemCategoryModal
        visible={showCreateCategoryModal}
        categoryName={newCategoryName}
        selectedParent={selectedParentCategory}
        itemCategories={localItemCategories}
        loading={categoryLoading}
        onCategoryName={setNewCategoryName}
        onParentSelect={setSelectedParentCategory}
        onCreate={handleCreateNewCategory}
        onClose={() => {
          setShowCreateCategoryModal(false);
          setNewCategoryName("");
          setSelectedParentCategory(null);
        }}
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
  itemCard: {
    marginBottom: 8,
  },
  itemContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {},
  itemPrice: {
    marginTop: 2,
  },
  removeButton: {
    minWidth: 80,
  },
  formSection: {
    marginTop: 16,
  },
  subSectionTitle: {
    marginBottom: 12,
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 8,
    maxHeight: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
  },
  dropdownItemText: {},
  dropdownItemPrice: {
    marginTop: 4,
  },
  label: {
    marginTop: 12,
    marginBottom: 8,
  },
  selectedContainer: {
    marginTop: 8,
  },
  selectedChip: {
    alignSelf: "flex-start",
  },
  addButton: {
    marginTop: 16,
  },
});
