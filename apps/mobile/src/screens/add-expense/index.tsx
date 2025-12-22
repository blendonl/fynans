import React, { useState } from "react";
import {
  ScrollView,
  Alert,
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Button } from "../../components/design-system";
import { useAppTheme } from "../../theme";
import { apiClient } from "../../api/client";
import { useCategories } from "./hooks/useCategories";
import { useStores } from "./hooks/useStores";
import { useExpenseItems } from "./hooks/useExpenseItems";
import { useImageUpload } from "../../hooks/useImageUpload";
import { CategorySelector } from "./components/CategorySelector";
import { StoreSelector } from "./components/StoreSelector";
import { ExpenseItemsForm } from "./components/ExpenseItemsForm";
import { AddStoreModal } from "./components/AddStoreModal";
import { ReceiptCamera } from "../transactions/add/components/ReceiptCamera";
import { ReceiptPreview } from "../../components/transactions/ReceiptPreview";

export default function AddExpenseScreen({ navigation }: any) {
  const { theme } = useAppTheme();
  const [submitLoading, setSubmitLoading] = useState(false);

  const categories = useCategories();
  const stores = useStores();
  const expenseItems = useExpenseItems();
  const imageUpload = useImageUpload();

  const isGroceryExpense =
    categories.selectedCategory?.isConnectedToStore === true;
  const showStoreSection = isGroceryExpense;
  const showExpenseItemsForm =
    categories.selectedCategory !== null &&
    (!isGroceryExpense || stores.selectedStore !== null);

  const handleSubmit = async () => {
    if (!categories.selectedCategory) {
      Alert.alert("Error", "Please select a category");
      return;
    }

    if (expenseItems.items.length === 0) {
      Alert.alert("Error", "Please add at least one item");
      return;
    }

    try {
      setSubmitLoading(true);

      let receiptUrls: string[] = [];
      if (imageUpload.imageUris.length > 0) {
        receiptUrls = await imageUpload.uploadImages();
      }

      const payload = {
        categoryId:
          expenseItems.currentItem.categoryId ?? categories.selectedCategory.id,
        storeName: expenseItems.currentItem.name ?? stores.storeInput,
        storeLocation: stores.storeLocation || "Unknown",
        items: expenseItems.items,
        receiptImages: receiptUrls,
      };

      await apiClient.post("/expenses", payload);
      imageUpload.clearImages();
      Alert.alert("Success", "Expense created successfully", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create expense");
    } finally {
      setSubmitLoading(false);
    }
  };

  const canSubmit = () => {
    if (!categories.selectedCategory || !expenseItems.currentItem) return false;
    if (isGroceryExpense && !stores.storeInput.trim()) return false;
    return expenseItems.items.length > 0;
  };

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          style={[
            styles.container,
            { backgroundColor: theme.colors.background },
          ]}
          keyboardShouldPersistTaps="handled"
        >
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

          {showExpenseItemsForm && (
            <ExpenseItemsForm
              items={expenseItems.items}
              currentItem={expenseItems.currentItem}
              itemCategories={categories.itemCategories}
              selectedStore={stores.selectedStore}
              onCurrentItemChange={expenseItems.setCurrentItem}
              onAddItem={expenseItems.handleAddItem}
              onRemoveItem={expenseItems.handleRemoveItem}
            />
          )}

          {showExpenseItemsForm && (
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
      </KeyboardAvoidingView>

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
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  submitButton: {
    marginTop: 16,
    marginBottom: 32,
  },
});
