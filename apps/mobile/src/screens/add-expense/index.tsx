import React, { useState } from "react";
import {
  ScrollView,
  Alert,
  StyleSheet,
  View,
  Text,
} from "react-native";
import {
  Button,
  DateTimePickerComponent,
  ToggleSwitch,
  Select,
} from "../../components/design-system";
import { useAppTheme } from "../../theme";
import { apiClient } from "../../api/client";
import { useFamily } from "../../context/FamilyContext";
import { useCategories } from "./hooks/useCategories";
import { useStores } from "./hooks/useStores";
import { useExpenseItems } from "./hooks/useExpenseItems";
import { useImageUpload } from "../../hooks/useImageUpload";
import { useReceiptScanning } from "../../hooks/useReceiptScanning";
import { CategorySelector } from "./components/CategorySelector";
import { StoreSelector } from "./components/StoreSelector";
import { ExpenseItemsForm } from "./components/ExpenseItemsForm";
import { AddStoreModal } from "./components/AddStoreModal";
import { ReceiptCamera } from "../transactions/add/components/ReceiptCamera";
import { ReceiptPreview } from "../../components/transactions/ReceiptPreview";

export default function AddExpenseScreen({ navigation }: any) {
  const { theme } = useAppTheme();
  const { families } = useFamily();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [recordedAt, setRecordedAt] = useState<Date>(new Date());
  const [isPersonal, setIsPersonal] = useState(true);
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null);

  const categories = useCategories();
  const stores = useStores();
  const expenseItems = useExpenseItems();
  const imageUpload = useImageUpload();
  const receiptScanning = useReceiptScanning();

  const isGroceryExpense =
    categories.selectedCategory?.isConnectedToStore === true;
  const hasScannedItems = expenseItems.items.some((item) => item.fromReceipt);
  const hasStoreData = stores.storeInput.trim() !== "";
  const showStoreSection = isGroceryExpense || hasScannedItems || hasStoreData;
  const showItemsList = expenseItems.items.length > 0;
  const isEditingItem =
    expenseItems.currentItem.name !== "" ||
    expenseItems.currentItem.price !== "";
  const showAddItemForm =
    (categories.selectedCategory !== null &&
      (!isGroceryExpense || stores.selectedStore !== null)) ||
    isEditingItem;

  const handleSubmit = async () => {
    if (!categories.selectedCategory) {
      Alert.alert("Error", "Please select a category");
      return;
    }

    if (!isPersonal && !selectedFamilyId) {
      Alert.alert("Error", "Please select a family for this expense");
      return;
    }

    if (expenseItems.items.length === 0) {
      Alert.alert("Error", "Please add at least one item");
      return;
    }

    const itemsWithMissingCategory = expenseItems.items.filter(
      (item) => !item.categoryId || item.categoryId === "",
    );

    if (itemsWithMissingCategory.length > 0) {
      Alert.alert(
        "Missing Information",
        `${itemsWithMissingCategory.length} item(s) are missing category assignments. Please assign categories to all items.`,
      );
      return;
    }

    try {
      setSubmitLoading(true);

      let receiptUrls: string[] = [];
      if (imageUpload.imageUris.length > 0) {
        receiptUrls = await imageUpload.uploadImages();
      }

      const payload = {
        categoryId: categories.selectedCategory.id,
        storeName:
          (showStoreSection ? stores.storeInput : "General") || "General",
        storeLocation: stores.storeLocation || "Unknown",
        recordedAt: recordedAt.toISOString(),
        scope: isPersonal ? "PERSONAL" : "FAMILY",
        familyId: !isPersonal ? selectedFamilyId : null,
        items: expenseItems.items.map((item) => ({
          categoryId: item.categoryId,
          itemName: item.name,
          itemPrice: item.price,
          discount: item.discount,
          quantity: item.quantity,
        })),
      };

      await apiClient.post("/expenses", payload);
      imageUpload.clearImages();
      navigation.navigate("Main", { screen: "Transactions" });
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create expense");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleScanReceipt = async () => {
    const scannedData = await receiptScanning.scanReceipt();

    if (!scannedData) {
      return;
    }

    if (scannedData.store) {
      stores.setStoreInput(scannedData.store.name);
      stores.setStoreLocation(scannedData.store.location);
    }

    if (scannedData.recordedAt) {
      setRecordedAt(new Date(scannedData.recordedAt));
    }

    const scannedItems = scannedData.items.map((item) => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      categoryId: item.category || "",
      discount: 0,
      fromReceipt: true,
    }));

    expenseItems.setItems(scannedItems);
  };

  const canSubmit = () => {
    if (expenseItems.items.length === 0) return false;
    if (hasScannedItems && !stores.storeInput.trim()) return false;
    return true;
  };

  return (
    <>
      <ScrollView
        style={[
          styles.container,
          { backgroundColor: theme.colors.background },
        ]}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
          <Button
            title="Scan Receipt"
            onPress={handleScanReceipt}
            loading={receiptScanning.processing}
            disabled={receiptScanning.processing}
            fullWidth
            style={styles.scanButton}
          />

          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                theme.custom.typography.h5,
                { color: theme.custom.colors.text },
              ]}
            >
              Expense Type
            </Text>
            <ToggleSwitch
              label="Personal Expense"
              value={isPersonal}
              onValueChange={(value) => {
                setIsPersonal(value);
                if (value) {
                  setSelectedFamilyId(null);
                }
              }}
            />
          </View>

          {!isPersonal && families.length > 0 && (
            <View style={styles.section}>
              <Select
                label="Select Family"
                value={selectedFamilyId}
                items={families.map((family) => ({
                  label: family.name,
                  value: family.id,
                }))}
                onValueChange={setSelectedFamilyId}
                placeholder="Choose a family"
              />
            </View>
          )}

          {!isPersonal && families.length === 0 && (
            <View style={styles.section}>
              <Text
                style={[
                  styles.warningText,
                  { color: theme.custom.colors.warning || theme.colors.error },
                ]}
              >
                You are not part of any family. Create or join a family to add
                family expenses.
              </Text>
            </View>
          )}

          <CategorySelector
            categoryInput={categories.categoryInput}
            selectedCategory={categories.selectedCategory}
            filteredCategories={categories.filteredCategories}
            showDropdown={categories.showCategoryDropdown}
            loading={categories.loading}
            onInputChange={categories.handleCategoryInputChange}
            onCategorySelect={categories.handleCategorySelect}
            onCreateNew={categories.handleCreateNewCategory}
            onClear={categories.clearCategory}
            onFocus={() => categories.setShowCategoryDropdown(true)}
          />

          {showStoreSection && (
            <StoreSelector
              storeInput={stores.storeInput}
              selectedStore={stores.selectedStore}
              stores={stores.stores}
              showDropdown={stores.showStoreDropdown}
              onInputChange={stores.handleStoreInputChange}
              onStoreSelect={stores.handleStoreSelect}
              onAddNew={stores.handleOpenAddStoreModal}
              onClear={stores.clearStore}
              onFocus={() => stores.setShowStoreDropdown(true)}
            />
          )}

          {categories.selectedCategory && (
            <View style={styles.section}>
              <DateTimePickerComponent
                label="Transaction Date & Time"
                value={recordedAt}
                onChange={setRecordedAt}
                mode="datetime"
                disabled={submitLoading}
              />
            </View>
          )}

          {(showItemsList || showAddItemForm) && (
            <ExpenseItemsForm
              items={expenseItems.items}
              currentItem={expenseItems.currentItem}
              itemCategories={categories.itemCategories}
              selectedStore={stores.selectedStore}
              onCurrentItemChange={expenseItems.setCurrentItem}
              onAddItem={expenseItems.handleAddItem}
              onEditItem={expenseItems.handleEditItem}
              onRemoveItem={expenseItems.handleRemoveItem}
              onUpdateQuantity={expenseItems.handleUpdateQuantity}
              showAddItemForm={showAddItemForm}
            />
          )}

          {showAddItemForm && (
            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionTitle,
                  theme.custom.typography.h5,
                  { color: theme.custom.colors.text },
                ]}
              >
                Receipt (Optional)
              </Text>
              <ReceiptCamera
                onImageSelected={imageUpload.addImage}
                disabled={imageUpload.uploading || submitLoading}
              />
              <ReceiptPreview
                imageUris={imageUpload.imageUris}
                onRemove={imageUpload.removeImage}
              />
            </View>
          )}

          {canSubmit() && (
            <Button
              title="Create Expense"
              onPress={handleSubmit}
              loading={submitLoading || imageUpload.uploading}
              disabled={submitLoading || imageUpload.uploading}
              fullWidth
              style={styles.submitButton}
            />
          )}
      </ScrollView>

      <AddStoreModal
        visible={stores.showAddStoreModal}
        storeName={stores.newStoreName}
        storeLocation={stores.newStoreLocation}
        loading={stores.loading}
        onStoreName={stores.setNewStoreName}
        onStoreLocation={stores.setNewStoreLocation}
        onCreate={stores.handleCreateNewStore}
        onClose={() => stores.setShowAddStoreModal(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 350,
  },
  scanButton: {
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  warningText: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 8,
  },
  submitButton: {
    marginTop: 16,
    marginBottom: 32,
  },
});
