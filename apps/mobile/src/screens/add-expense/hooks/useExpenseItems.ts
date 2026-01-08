import { useState } from "react";
import { Alert } from "react-native";
import { ExpenseItem, CurrentItem } from "../../../features/expenses/types";
import { apiClient } from "../../../api/client";

export function useExpenseItems() {
  const [items, setItems] = useState<ExpenseItem[]>([]);
  const [currentItem, setCurrentItem] = useState<CurrentItem>({
    name: "",
    price: "",
    discount: "",
    quantity: "1",
    categoryId: "",
  });

  const handleAddItem = async (storeId?: string, saveToStore?: boolean) => {
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
      quantity: parseInt(currentItem.quantity) || 1,
      categoryId: currentItem.categoryId,
      fromReceipt: currentItem.fromReceipt,
    };

    // if (saveToStore && storeId) {
    //   try {
    //     // We need to import apiClient here or pass it in, but since this is a hook,
    //     // we can import it at the top level.
    //     // Note: I will add the import in a separate step if it's not available.
    //     // Assuming apiClient is available or I will add it.
    //
    //     await apiClient.post(`/stores/${storeId}/items`, {
    //       name: newItem.name,
    //       price: newItem.price,
    //       categoryId: newItem.categoryId,
    //       isDiscounted: newItem.discount > 0,
    //     });
    //   } catch (error) {
    //     console.error("Failed to save item to store:", error);
    //     // We don't block adding the item to the list if saving to store fails,
    //     // but maybe we should alert the user?
    //     // For now, let's just log it as it's a "nice to have" feature
    //     // that shouldn't break the main flow.
    //   }
    // }

    setItems([...items, newItem]);
    setCurrentItem({
      name: "",
      price: "",
      discount: "",
      quantity: "1",
      categoryId: "",
    });
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleUpdateQuantity = (index: number, change: number) => {
    const newItems = [...items];
    const newQuantity = newItems[index].quantity + change;

    if (newQuantity > 0) {
      newItems[index].quantity = newQuantity;
      setItems(newItems);
    } else {
      handleRemoveItem(index);
    }
  };

  const handleEditItem = (index: number) => {
    const itemToEdit = items[index];
    setCurrentItem({
      name: itemToEdit.name,
      price: itemToEdit.price.toString(),
      discount: itemToEdit.discount > 0 ? itemToEdit.discount.toString() : "",
      quantity: itemToEdit.quantity.toString(),
      categoryId: itemToEdit.categoryId,
      fromReceipt: itemToEdit.fromReceipt,
    });

    handleRemoveItem(index);
  };

  const hasMissingCategory = (item: ExpenseItem): boolean => {
    return !item.categoryId || item.categoryId === "";
  };

  return {
    items,
    currentItem,
    handleAddItem,
    setCurrentItem,
    handleRemoveItem,
    handleUpdateQuantity,
    handleEditItem,
    hasMissingCategory,
    setItems,
  };
}
