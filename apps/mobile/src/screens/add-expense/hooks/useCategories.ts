import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { apiClient } from "../../../api/client";
import { Category } from "../../../features/expenses/types";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [itemCategories, setItemCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [categoryInput, setCategoryInput] = useState("");
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isConnectedToStore, setIsConnectedToStore] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchItemCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/expense-categories");
      const normalizedCategories = (response.data || []).map((cat: any) => ({
        ...cat,
        isConnectedToStore: Boolean(cat.isConnectedToStore),
      }));
      setCategories(normalizedCategories);
    } catch (error: any) {
      Alert.alert("Error", "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const fetchItemCategories = async () => {
    try {
      const response = await apiClient.get("/expense-item-categories");
      const normalizedCategories = (response.data || []).map((cat: any) => ({
        ...cat,
        isConnectedToStore: Boolean(cat.isConnectedToStore),
      }));
      setItemCategories(normalizedCategories);
    } catch (error: any) {
      console.error("Failed to fetch item categories:", error);
    }
  };

  const handleCategoryInputChange = (text: string) => {
    setCategoryInput(text);
    setShowCategoryDropdown(true);

    if (text.trim() === "") {
      setFilteredCategories(categories);
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
    setNewCategoryName(categoryInput.trim());
    setShowCategoryDropdown(false);
    setShowAddCategoryModal(true);
  };

  const handleConfirmCreateCategory = async () => {
    const trimmedName = newCategoryName.trim();

    if (!trimmedName) {
      Alert.alert("Error", "Please enter a category name");
      return;
    }

    const existingCategory = categories.find(
      (cat) => cat.name.toLowerCase() === trimmedName.toLowerCase(),
    );

    if (existingCategory) {
      handleCategorySelect(existingCategory);
      setShowAddCategoryModal(false);
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.post("/expense-categories", {
        name: trimmedName,
        isConnectedToStore: isConnectedToStore,
      });

      const newCategory: Category = {
        id: response.id,
        name: response.name,
        isConnectedToStore: Boolean(response.isConnectedToStore),
      };

      setCategories([...categories, newCategory]);
      handleCategorySelect(newCategory);
      setShowAddCategoryModal(false);
      setNewCategoryName("");
      setIsConnectedToStore(false);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  const clearCategory = () => {
    setSelectedCategory(null);
    setCategoryInput("");
    setShowCategoryDropdown(true);
  };

  return {
    categories,
    itemCategories,
    selectedCategory,
    categoryInput,
    filteredCategories,
    showCategoryDropdown,
    loading,
    showAddCategoryModal,
    newCategoryName,
    isConnectedToStore,
    handleCategoryInputChange,
    handleCategorySelect,
    handleCreateNewCategory,
    handleConfirmCreateCategory,
    clearCategory,
    setShowCategoryDropdown,
    setShowAddCategoryModal,
    setNewCategoryName,
    setIsConnectedToStore,
  };
}
