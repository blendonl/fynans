import React, { useState, useEffect } from "react";
import { View, Text, Alert, StyleSheet } from "react-native";
import { IconButton } from "react-native-paper";
import {
  Category,
  ExpenseItem,
  CurrentItem,
  Store,
} from "../../../features/expenses/types";
import {
  Input,
  Button,
  Card,
  Chip,
  Dropdown,
} from "../../../components/design-system";
import { PriceInput, QuantityInput } from "../../../components/forms";
import { useAppTheme } from "../../../theme";
import { apiClient } from "../../../api/client";
import { AddItemCategoryModal } from "./AddItemCategoryModal";

interface StoreItem {
  id: string;
  name: string;
  price?: number;
  discount?: number;
  categoryId?: string;
}

interface ExpenseItemsFormProps {
  items: ExpenseItem[];
  currentItem: CurrentItem;
  itemCategories: Category[];
  selectedStore: Store | null;
  onCurrentItemChange: (item: CurrentItem) => void;
  onAddItem: (storeId?: string, saveToStore?: boolean) => void;
  onEditItem: (index: number) => void;
  onRemoveItem: (index: number) => void;
  onUpdateQuantity: (index: number, change: number) => void;
  showAddItemForm?: boolean;
}

export function ExpenseItemsForm({
  items,
  currentItem,
  itemCategories,
  selectedStore,
  onCurrentItemChange,
  onAddItem,
  onEditItem,
  onRemoveItem,
  onUpdateQuantity,
  showAddItemForm = true,
}: ExpenseItemsFormProps) {
  const { theme } = useAppTheme();
  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [filteredStoreItems, setFilteredStoreItems] = useState<StoreItem[]>([]);
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [showPriceFields, setShowPriceFields] = useState(false);
  const [isExistingItem, setIsExistingItem] = useState(false);
  const [isCreatingNewItem, setIsCreatingNewItem] = useState(false);

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
    fetchStoreItems();
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
      const endpoint = selectedStore 
        ? `/stores/${selectedStore.id}/items`
        : `/items`;
      
      const response = await apiClient.get(endpoint);

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

    if (!text.trim()) {
      setShowPriceFields(false);
      setIsCreatingNewItem(false);
    }
  };

  const handleSelectStoreItem = (item: StoreItem) => {
    onCurrentItemChange({
      name: item.name,
      price: item.price?.toString() || "",
      discount: item.discount && item.discount > 0 ? item.discount.toString() : "",
      quantity: "1",
      categoryId: item.categoryId || "",
    });

    const category = localItemCategories.find(
      (cat) => cat.id === item.categoryId,
    );
    if (category) {
      setSelectedItemCategory(category);
      setCategoryInput(category.name);
    }

    setShowItemDropdown(false);
    setShowPriceFields(true);
    setIsExistingItem(true);
    setIsCreatingNewItem(false);
  };

  const handleCreateNewItem = () => {
    setIsCreatingNewItem(true);
    setShowItemDropdown(false);
    setShowPriceFields(true);
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
        id: response.id,
        name: response.name,
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
      setIsCreatingNewItem(false);
      setShowPriceFields(false);
      setCategoryInput("");
      setSelectedItemCategory(null);
      setShowCategoryDropdown(false);
    } else if (currentItem.name && currentItem.price) {
      setShowPriceFields(true);
      setShowItemDropdown(false);
      setIsCreatingNewItem(true);

      if (currentItem.categoryId) {
        const category = localItemCategories.find(
          (cat) => cat.id === currentItem.categoryId,
        );
        if (category) {
          setSelectedItemCategory(category);
          setCategoryInput(category.name);
          setShowCategoryDropdown(false);
        }
      }
    }
  }, [currentItem, localItemCategories]);

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

      {items.map((item, index) => {
        const needsCategory = !item.categoryId || item.categoryId === "";
        const itemCategory = localItemCategories.find(
          (cat) => cat.id === item.categoryId,
        );

        return (
          <Card
            key={index}
            style={needsCategory ? {...styles.itemCard, ...styles.itemCardError} : styles.itemCard}
            elevation={1}
          >
            <View style={styles.itemContent}>
              <View style={styles.itemInfo}>
                <Text
                  style={[
                    styles.itemName,
                    theme.custom.typography.bodyMedium,
                    { color: theme.custom.colors.text },
                  ]}
                >
                  {item.quantity > 1 && `${Number(item.quantity) % 1 === 0 ? item.quantity : Number(item.quantity).toFixed(3).replace(/\.?0+$/, '')}x `}
                  {item.name}
                </Text>

                {needsCategory ? (
                  <Text
                    style={[
                      styles.itemWarning,
                      theme.custom.typography.caption,
                      { color: theme.custom.colors.error },
                    ]}
                  >
                    Category required
                  </Text>
                ) : (
                  <Text
                    style={[
                      styles.itemCategory,
                      theme.custom.typography.caption,
                      { color: theme.custom.colors.textSecondary },
                    ]}
                  >
                    {itemCategory?.name || "Unknown category"}
                  </Text>
                )}

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

              <View style={styles.itemActions}>
                {item.fromReceipt && (
                  <IconButton
                    icon="pencil"
                    size={20}
                    onPress={() => onEditItem(index)}
                  />
                )}

                <View style={styles.quantityControls}>
                  <IconButton
                    icon="minus"
                    size={20}
                    onPress={() => onUpdateQuantity(index, -1)}
                  />
                  <Text
                    style={[
                      theme.custom.typography.bodyMedium,
                      { color: theme.custom.colors.text, marginHorizontal: 4 },
                    ]}
                  >
                    {item.quantity}
                  </Text>
                  <IconButton
                    icon="plus"
                    size={20}
                    onPress={() => onUpdateQuantity(index, 1)}
                  />
                </View>
              </View>
            </View>
          </Card>
        );
      })}

      {showAddItemForm && (
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

            <Dropdown
              items={filteredStoreItems.map((item) => ({
                id: item.id,
                label: item.name,
                subtitle: item.price !== undefined 
                  ? `$${item.price.toFixed(2)}${item.discount && item.discount > 0 ? ` (-$${item.discount.toFixed(2)})` : ""}`
                  : undefined,
              }))}
              visible={showItemDropdown}
              onSelect={(item) => {
                const storeItem = filteredStoreItems.find(
                  (si) => si.id === item.id,
                );
                if (storeItem) handleSelectStoreItem(storeItem);
              }}
              onCreate={handleCreateNewItem}
              createLabel={`+ Create new item: "${currentItem.name}"`}
              showCreateOption={currentItem.name.trim() !== ""}
              emptyMessage="No matching items"
            />
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
              <QuantityInput
                label="Quantity"
                value={currentItem.quantity}
                onChangeText={(text) =>
                  onCurrentItemChange({ ...currentItem, quantity: text })
                }
                placeholder="1"
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

                  <Dropdown
                    items={filteredItemCategories.map((cat) => ({
                      id: cat.id,
                      label: cat.name,
                    }))}
                    visible={showCategoryDropdown}
                    onSelect={(item) => {
                      const category = filteredItemCategories.find(
                        (cat) => cat.id === item.id,
                      );
                      if (category) handleCategorySelect(category);
                    }}
                    onCreate={handleOpenCreateCategoryModal}
                    createLabel={`+ Create new category: "${categoryInput}"`}
                    showCreateOption={
                      categoryInput.trim() !== "" &&
                      !filteredItemCategories.some(
                        (cat) =>
                          cat.name.toLowerCase() ===
                          categoryInput.toLowerCase(),
                      )
                    }
                    emptyMessage="No matching categories"
                  />
                </>
              )}
            </>
          )}

          {showPriceFields && (
            <Button
              title="Add Item"
              onPress={() => onAddItem(selectedStore?.id, isCreatingNewItem)}
              variant="secondary"
              fullWidth
              style={styles.addButton}
            />
          )}
        </View>
      )}

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
  itemCardError: {
    borderWidth: 2,
    borderColor: "#EF4444",
  },
  itemWarning: {
    marginTop: 2,
  },
  itemCategory: {
    marginTop: 2,
  },
  itemActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  formSection: {
    marginTop: 16,
  },
  subSectionTitle: {
    marginBottom: 12,
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
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
  },
});
