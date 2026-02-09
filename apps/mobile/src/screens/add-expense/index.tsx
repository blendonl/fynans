import React, { useState, useEffect } from "react";
import {
  ScrollView,
  Alert,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import * as Haptics from "expo-haptics";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Button,
  Input,
  DateTimePickerComponent,
} from "../../components/design-system";
import { PriceInput } from "../../components/forms";
import { useAppTheme } from "../../theme";
import { apiClient } from "../../api/client";
import { useToast } from "../../context/ToastContext";
import { useCategories } from "./hooks/useCategories";
import { useStores } from "./hooks/useStores";
import { useExpenseItems } from "./hooks/useExpenseItems";
import { useImageUpload } from "../../hooks/useImageUpload";
import { useReceiptScanning } from "../../hooks/useReceiptScanning";
import { CategorySelector } from "./components/CategorySelector";
import { StoreSelector } from "./components/StoreSelector";
import { ExpenseItemsForm } from "./components/ExpenseItemsForm";
import { FormProgress } from "./components/FormProgress";
import { AddStoreModal } from "./components/AddStoreModal";
import { AddCategoryModal } from "./components/AddCategoryModal";
import { ReceiptCamera } from "../transactions/add/components/ReceiptCamera";
import { ReceiptPreview } from "../../components/transactions/ReceiptPreview";
import { formatCurrency } from "../../utils/currency";

type TransactionScope = "PERSONAL" | "FAMILY";

interface AddExpenseScreenProps {
  navigation: any;
  hasDataRef?: React.MutableRefObject<boolean>;
  scope: TransactionScope;
  selectedFamilyId: string | null;
}

export default function AddExpenseScreen({
  navigation,
  hasDataRef,
  scope,
  selectedFamilyId,
}: AddExpenseScreenProps) {
  const { theme } = useAppTheme();
  const { showToast } = useToast();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [recordedAt, setRecordedAt] = useState<Date>(new Date());
  const [isItemized, setIsItemized] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [simpleAmount, setSimpleAmount] = useState("");
  const [simpleNote, setSimpleNote] = useState("");

  const categoriesHook = useCategories();
  const stores = useStores();
  const expenseItems = useExpenseItems();
  const imageUpload = useImageUpload();
  const receiptScanning = useReceiptScanning();

  const isGroceryExpense =
    categoriesHook.selectedCategory?.isConnectedToStore === true;
  const hasScannedItems = expenseItems.items.some((item) => item.fromReceipt);
  const showStoreSection = isGroceryExpense;
  const showItemsList = expenseItems.items.length > 0;
  const isEditingItem =
    expenseItems.currentItem.name !== "" ||
    expenseItems.currentItem.price !== "";
  const showAddItemForm =
    (categoriesHook.selectedCategory !== null &&
      (!isGroceryExpense || stores.selectedStore !== null)) ||
    isEditingItem;

  useEffect(() => {
    if (!hasDataRef) return;
    const hasData =
      expenseItems.items.length > 0 ||
      categoriesHook.selectedCategory !== null ||
      expenseItems.currentItem.name !== "" ||
      expenseItems.currentItem.price !== "" ||
      simpleAmount !== "" ||
      simpleNote !== "";
    hasDataRef.current = hasData;
  }, [
    expenseItems.items,
    categoriesHook.selectedCategory,
    expenseItems.currentItem,
    simpleAmount,
    simpleNote,
    hasDataRef,
  ]);

  const canSubmit = () => {
    if (!categoriesHook.selectedCategory) return false;

    if (!isItemized) {
      return simpleAmount !== "" && parseFloat(simpleAmount) > 0;
    }

    if (expenseItems.items.length === 0) return false;
    if (hasScannedItems && !stores.storeInput.trim()) return false;
    return true;
  };

  const getValidationHint = (): string | null => {
    if (!categoriesHook.selectedCategory) return "Select a category to continue";

    if (!isItemized) {
      if (!simpleAmount || parseFloat(simpleAmount) <= 0) return "Enter an amount to continue";
      return null;
    }

    if (isGroceryExpense && !stores.selectedStore && !stores.storeInput)
      return "Select a store to continue";
    if (expenseItems.items.length === 0) return "Add at least one item";
    return null;
  };

  const handleSwitchToItemized = () => {
    setIsItemized(true);
    if (simpleAmount && parseFloat(simpleAmount) > 0) {
      expenseItems.setCurrentItem({
        ...expenseItems.currentItem,
        price: simpleAmount,
        name: simpleNote || "",
        quantity: "1",
        discount: "",
        categoryId: categoriesHook.selectedCategory?.id || "",
      });
    }
  };

  const handleSubmit = async () => {
    const errors: Record<string, string> = {};

    if (!categoriesHook.selectedCategory) {
      errors.category = "Please select a category";
    }

    if (scope === "FAMILY" && !selectedFamilyId) {
      errors.family = "Please select a family for this expense";
    }

    if (!isItemized) {
      if (!simpleAmount || parseFloat(simpleAmount) <= 0) {
        errors.amount = "Please enter a valid amount";
      }

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }
      setFormErrors({});

      try {
        setSubmitLoading(true);

        const payload = {
          categoryId: categoriesHook.selectedCategory!.id,
          recordedAt: recordedAt.toISOString(),
          scope,
          familyId: scope === "FAMILY" ? selectedFamilyId : null,
          items: [
            {
              categoryId: categoriesHook.selectedCategory!.id,
              itemName: simpleNote.trim() || categoriesHook.selectedCategory!.name,
              itemPrice: parseFloat(simpleAmount),
              discount: 0,
              quantity: 1,
            },
          ],
        };

        await apiClient.post("/expenses", payload);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        const total = parseFloat(simpleAmount);
        showToast({
          type: "EXPENSE_ADDED",
          title: "Expense created",
          message: `${formatCurrency(total)} recorded`,
        });
        navigation.navigate("Main", { screen: "Transactions" });
      } catch (error: any) {
        Alert.alert("Error", error.message || "Failed to create expense");
      } finally {
        setSubmitLoading(false);
      }
      return;
    }

    if (isGroceryExpense && !stores.selectedStore && !stores.storeInput) {
      errors.store = "Please select a store for this category";
    }

    if (expenseItems.items.length === 0) {
      errors.items = "Please add at least one item";
    }

    const itemsWithMissingCategory = expenseItems.items.filter(
      (item) => !item.categoryId || item.categoryId === "",
    );

    if (itemsWithMissingCategory.length > 0) {
      errors.itemCategories = `${itemsWithMissingCategory.length} item(s) are missing category assignments`;
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    try {
      setSubmitLoading(true);

      let receiptUrls: string[] = [];
      if (imageUpload.imageUris.length > 0) {
        receiptUrls = await imageUpload.uploadImages();
      }

      const payload = {
        categoryId: categoriesHook.selectedCategory!.id,
        storeName: showStoreSection ? stores.storeInput : undefined,
        storeLocation: showStoreSection ? stores.storeLocation : undefined,
        recordedAt: recordedAt.toISOString(),
        scope,
        familyId: scope === "FAMILY" ? selectedFamilyId : null,
        items: expenseItems.items.map((item) => ({
          categoryId: item.categoryId,
          itemName: item.name,
          itemPrice: item.price,
          discount: item.discount,
          quantity: parseFloat(item.quantity.toString()) || 1,
        })),
      };

      await apiClient.post("/expenses", payload);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      imageUpload.clearImages();

      const total = expenseItems.items.reduce(
        (sum, item) => sum + (item.price - item.discount) * item.quantity,
        0,
      );
      showToast({
        type: "EXPENSE_ADDED",
        title: "Expense created",
        message: `${formatCurrency(total)} recorded`,
      });

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

    if (!isItemized) {
      setIsItemized(true);
    }
  };

  const handleRemoveItem = (index: number) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    expenseItems.handleRemoveItem(index);
    showToast({
      type: "ITEM_REMOVED",
      title: "Item removed",
      message: "Tap to undo",
      action: {
        label: "Undo",
        onPress: () => expenseItems.undoRemoveItem(),
      },
    });
  };

  const progressSteps = [
    {
      label: "Category",
      completed: categoriesHook.selectedCategory !== null,
      active: categoriesHook.selectedCategory === null,
    },
    ...(isGroceryExpense
      ? [
          {
            label: "Store",
            completed: stores.selectedStore !== null || stores.storeInput.trim() !== "",
            active:
              categoriesHook.selectedCategory !== null &&
              !stores.selectedStore &&
              !stores.storeInput.trim(),
          },
        ]
      : []),
    {
      label: "Items",
      completed: expenseItems.items.length > 0,
      active:
        categoriesHook.selectedCategory !== null &&
        expenseItems.items.length === 0,
    },
    {
      label: "Review",
      completed: false,
      active: canSubmit(),
    },
  ];

  const validationHint = getValidationHint();

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
        <CategorySelector
          categoryInput={categoriesHook.categoryInput}
          selectedCategory={categoriesHook.selectedCategory}
          filteredCategories={categoriesHook.filteredCategories}
          showDropdown={categoriesHook.showCategoryDropdown}
          loading={categoriesHook.loading}
          onInputChange={categoriesHook.handleCategoryInputChange}
          onCategorySelect={categoriesHook.handleCategorySelect}
          onCreateNew={categoriesHook.handleCreateNewCategory}
          onClear={categoriesHook.clearCategory}
          onFocus={() => categoriesHook.setShowCategoryDropdown(true)}
        />

        {categoriesHook.selectedCategory && !isItemized && (
          <>
            <View style={styles.section}>
              <PriceInput
                label="Total Amount"
                value={simpleAmount}
                onChangeText={setSimpleAmount}
                placeholder="0.00"
                error={!!formErrors.amount}
                errorText={formErrors.amount}
              />
            </View>

            <View style={styles.section}>
              <Input
                label="Note (optional)"
                placeholder="What was this expense for?"
                value={simpleNote}
                onChangeText={setSimpleNote}
                leftIcon="note-text"
              />
            </View>

            <TouchableOpacity
              onPress={handleSwitchToItemized}
              style={styles.itemizeLink}
            >
              <MaterialCommunityIcons
                name="format-list-bulleted"
                size={18}
                color={theme.colors.primary}
              />
              <Text
                style={[
                  theme.custom.typography.bodyMedium,
                  { color: theme.colors.primary, marginLeft: 8 },
                ]}
              >
                Break down into items
              </Text>
            </TouchableOpacity>
          </>
        )}

        {categoriesHook.selectedCategory && isItemized && (
          <>
            <FormProgress steps={progressSteps} />

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

            {(showItemsList || showAddItemForm) && (
              <ExpenseItemsForm
                items={expenseItems.items}
                currentItem={expenseItems.currentItem}
                itemCategories={categoriesHook.itemCategories}
                selectedStore={stores.selectedStore}
                editingIndex={expenseItems.editingIndex}
                itemErrors={expenseItems.itemErrors}
                onCurrentItemChange={expenseItems.setCurrentItem}
                onAddItem={expenseItems.handleAddItem}
                onEditItem={expenseItems.handleEditItem}
                onCancelEdit={expenseItems.cancelEdit}
                onRemoveItem={handleRemoveItem}
                onUpdateQuantity={expenseItems.handleUpdateQuantity}
                showAddItemForm={showAddItemForm}
              />
            )}

            {showAddItemForm && (
              <Button
                title="Scan Receipt"
                onPress={handleScanReceipt}
                loading={receiptScanning.processing}
                disabled={receiptScanning.processing}
                fullWidth
                variant="outlined"
                style={styles.scanButton}
              />
            )}

            {showItemsList && (
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
          </>
        )}

        {categoriesHook.selectedCategory && (
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

        {validationHint && !canSubmit() && (
          <Text
            style={[
              styles.hintText,
              theme.custom.typography.caption,
              { color: theme.custom.colors.textSecondary },
            ]}
          >
            {validationHint}
          </Text>
        )}

        <Button
          title="Create Expense"
          onPress={handleSubmit}
          loading={submitLoading || imageUpload.uploading}
          disabled={!canSubmit() || submitLoading || imageUpload.uploading}
          fullWidth
          style={styles.submitButton}
        />
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

      <AddCategoryModal
        visible={categoriesHook.showAddCategoryModal}
        categoryName={categoriesHook.newCategoryName}
        isConnectedToStore={categoriesHook.isConnectedToStore}
        loading={categoriesHook.loading}
        onCategoryName={categoriesHook.setNewCategoryName}
        onIsConnectedToStore={categoriesHook.setIsConnectedToStore}
        onCreate={categoriesHook.handleConfirmCreateCategory}
        onClose={() => {
          categoriesHook.setShowAddCategoryModal(false);
          categoriesHook.setNewCategoryName("");
          categoriesHook.setIsConnectedToStore(false);
        }}
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
    paddingBottom: 100,
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
  itemizeLink: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 24,
  },
  hintText: {
    textAlign: "center",
    marginBottom: 8,
  },
  submitButton: {
    marginTop: 16,
    marginBottom: 32,
  },
});
