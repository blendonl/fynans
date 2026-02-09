import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import {
  Input,
  Button,
  Chip,
  Dropdown,
  DateTimePickerComponent,
} from "../components/design-system";
import { PriceInput } from "../components/forms";
import { useAppTheme } from "../theme";
import { apiClient } from "../api/client";
import { useImageUpload } from "../hooks/useImageUpload";
import { ReceiptCamera } from "./transactions/add/components/ReceiptCamera";
import { ReceiptPreview } from "../components/transactions/ReceiptPreview";
import { Category } from "../features/expenses/types";

type TransactionScope = "PERSONAL" | "FAMILY";

interface AddIncomeScreenProps {
  navigation: any;
  hasDataRef?: React.MutableRefObject<boolean>;
  scope: TransactionScope;
  selectedFamilyId: string | null;
}

export default function AddIncomeScreen({
  navigation,
  hasDataRef,
  scope,
  selectedFamilyId,
}: AddIncomeScreenProps) {
  const { theme } = useAppTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [categoryInput, setCategoryInput] = useState("");
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const [incomeAmount, setIncomeAmount] = useState("");
  const [incomeDescription, setIncomeDescription] = useState("");
  const [recordedAt, setRecordedAt] = useState<Date>(new Date());

  const imageUpload = useImageUpload();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!hasDataRef) return;
    hasDataRef.current =
      selectedCategory !== null ||
      incomeAmount !== "" ||
      incomeDescription !== "";
  }, [selectedCategory, incomeAmount, incomeDescription, hasDataRef]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/expense-categories");
      setCategories(response.data || []);
    } catch (error: any) {
      Alert.alert("Error", "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryInputChange = (text: string) => {
    setCategoryInput(text);
    setShowCategoryDropdown(true);

    if (text.trim() === "") {
      setFilteredCategories([]);
      setSelectedCategory(null);
      return;
    }

    const filtered = categories.filter((cat) =>
      cat.name.toLowerCase().includes(text.toLowerCase()),
    );
    setFilteredCategories(filtered);
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setCategoryInput(category.name);
    setShowCategoryDropdown(false);
    setFilteredCategories([]);
  };

  const handleCreateNewCategory = async () => {
    const trimmedName = categoryInput.trim();

    if (!trimmedName) {
      Alert.alert("Error", "Please enter a category name");
      return;
    }

    const existingCategory = categories.find(
      (cat) => cat.name.toLowerCase() === trimmedName.toLowerCase(),
    );

    if (existingCategory) {
      handleCategorySelect(existingCategory);
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.post("/expense-categories", {
        name: trimmedName,
      });

      const newCategory: Category = {
        id: response.id,
        name: response.name,
      };

      setCategories([...categories, newCategory]);
      handleCategorySelect(newCategory);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCategory) {
      Alert.alert("Error", "Please select a category");
      return;
    }

    if (scope === "FAMILY" && !selectedFamilyId) {
      Alert.alert("Error", "Please select a family for this income");
      return;
    }

    if (!incomeAmount || parseFloat(incomeAmount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    try {
      setLoading(true);

      let receiptUrls: string[] = [];
      if (imageUpload.imageUris.length > 0) {
        receiptUrls = await imageUpload.uploadImages();
      }

      const payload = {
        type: "INCOME",
        value: parseFloat(incomeAmount),
        userId: "current-user",
        description: incomeDescription,
        categoryId: selectedCategory.id,
        recordedAt: recordedAt.toISOString(),
        familyId: scope === "FAMILY" ? selectedFamilyId : undefined,
        receiptImages: receiptUrls,
      };

      await apiClient.post("/transactions", payload);
      imageUpload.clearImages();
      navigation.navigate("Main", { screen: "Transactions" });
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create income");
    } finally {
      setLoading(false);
    }
  };

  const renderCategorySelection = () => {
    const hasExactMatch = filteredCategories.some(
      (cat) => cat.name.toLowerCase() === categoryInput.toLowerCase(),
    );
    const showCreateOption = categoryInput.trim() !== "" && !hasExactMatch;

    return (
      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            theme.custom.typography.h5,
            { color: theme.custom.colors.text },
          ]}
        >
          Income Category
        </Text>

        {selectedCategory && !showCategoryDropdown ? (
          <View style={styles.selectedContainer}>
            <Chip
              label={selectedCategory.name}
              selected={true}
              onClose={() => {
                setSelectedCategory(null);
                setCategoryInput("");
                setShowCategoryDropdown(true);
              }}
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
          items={filteredCategories.map((cat) => ({
            id: cat.id,
            label: cat.name,
          }))}
          visible={
            showCategoryDropdown &&
            (categoryInput.trim() !== "" || filteredCategories.length > 0)
          }
          loading={loading}
          onSelect={(item) => {
            const category = filteredCategories.find(
              (cat) => cat.id === item.id,
            );
            if (category) handleCategorySelect(category);
          }}
          onCreate={handleCreateNewCategory}
          createLabel={`+ Create new category: "${categoryInput}"`}
          showCreateOption={showCreateOption}
          emptyMessage="No matching categories"
        />
      </View>
    );
  };

  const renderIncomeForm = () => (
    <View style={styles.section}>
      <Text
        style={[
          styles.sectionTitle,
          theme.custom.typography.h5,
          { color: theme.custom.colors.text },
        ]}
      >
        Income Details
      </Text>
      <PriceInput
        label="Amount"
        value={incomeAmount}
        onChangeText={setIncomeAmount}
        placeholder="0.00"
      />
      <Input
        label="Description (optional)"
        value={incomeDescription}
        onChangeText={setIncomeDescription}
        multiline
        numberOfLines={4}
      />
    </View>
  );

  const canSubmit = () => {
    if (!selectedCategory) return false;
    return incomeAmount && parseFloat(incomeAmount) > 0;
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      {renderCategorySelection()}

        {selectedCategory && renderIncomeForm()}

        {selectedCategory && (
          <View style={styles.section}>
            <DateTimePickerComponent
              label="Transaction Date & Time"
              value={recordedAt}
              onChange={setRecordedAt}
              mode="datetime"
              disabled={loading}
            />
          </View>
        )}

        {selectedCategory && (
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
              disabled={imageUpload.uploading || loading}
            />
            <ReceiptPreview
              imageUris={imageUpload.imageUris}
              onRemove={imageUpload.removeImage}
            />
          </View>
        )}

        <Button
          title="Create Income"
          onPress={handleSubmit}
          loading={loading || imageUpload.uploading}
          disabled={!canSubmit() || loading || imageUpload.uploading}
          fullWidth
          style={styles.submitButton}
        />
    </ScrollView>
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
    alignSelf: "flex-start",
  },
  submitButton: {
    marginTop: 16,
    marginBottom: 32,
  },
});
