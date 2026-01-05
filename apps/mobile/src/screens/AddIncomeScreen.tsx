import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Input,
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DateTimePickerComponent,
  ToggleSwitch,
} from "../components/design-system";
import { PriceInput } from "../components/forms";
import { useAppTheme } from "../theme";
import { apiClient } from "../api/client";
import { useFamily } from "../context/FamilyContext";
import { useImageUpload } from "../hooks/useImageUpload";
import { ReceiptCamera } from "./transactions/add/components/ReceiptCamera";
import { ReceiptPreview } from "../components/transactions/ReceiptPreview";
import { Category } from "../features/expenses/types";

export default function AddIncomeScreen({ navigation }: any) {
  const { theme } = useAppTheme();
  const { families } = useFamily();
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
  const [isPersonal, setIsPersonal] = useState(true);
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null);

  const imageUpload = useImageUpload();

  useEffect(() => {
    fetchCategories();
  }, []);

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

    if (!isPersonal && !selectedFamilyId) {
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
        familyId: !isPersonal ? selectedFamilyId : undefined,
        receiptImages: receiptUrls,
      };

      await apiClient.post("/transactions", payload);
      imageUpload.clearImages();
      navigation.navigate("Transactions");
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.flex}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        keyboardShouldPersistTaps="handled"
      >
        {renderCategorySelection()}

        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              theme.custom.typography.h5,
              { color: theme.custom.colors.text },
            ]}
          >
            Income Type
          </Text>
          <ToggleSwitch
            label="Personal Income"
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
            <Dropdown
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
              family income.
            </Text>
          </View>
        )}

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

        {canSubmit() && (
          <Button
            title="Create Income"
            onPress={handleSubmit}
            loading={loading || imageUpload.uploading}
            disabled={loading || imageUpload.uploading}
            fullWidth
            style={styles.submitButton}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
  selectedContainer: {
    marginTop: 8,
  },
  selectedChip: {
    alignSelf: "flex-start",
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
