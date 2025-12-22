import { useState } from "react";
import { Alert } from "react-native";
import { ExpenseItem, CurrentItem } from "../types";

export function useExpenseItems() {
  const [items, setItems] = useState<ExpenseItem[]>([]);
  const [currentItem, setCurrentItem] = useState<CurrentItem>({
    name: "",
    price: "",
    discount: "",
    categoryId: "",
  });

  const handleAddItem = () => {
    if (!currentItem.name?.trim()) {
      Alert.alert("Error", "Please enter item name");
      return;
    }
    if (!currentItem.price || parseFloat(currentItem.price) <= 0) {
      Alert.alert("Error", "Please enter a valid price");
      return;
    }

    if (!currentItem.categoryId) {
      Alert.alert("Error", `Please select an item category `);
      return;
    }

    const newItem: ExpenseItem = {
      name: currentItem.name,
      price: parseFloat(currentItem.price),
      discount: currentItem.discount ? parseFloat(currentItem.discount) : 0,
      categoryId: currentItem.categoryId,
    };

    setItems([...items, newItem]);
    setCurrentItem({
      name: "",
      price: "",
      discount: "",
      categoryId: "",
    });
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return {
    items,
    currentItem,
    handleAddItem,
    setCurrentItem,
    handleRemoveItem,
  };
}
