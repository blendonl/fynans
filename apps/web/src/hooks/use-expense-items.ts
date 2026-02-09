import { useState } from "react";
import type { ExpenseItem, CurrentItem } from "@mmoneymanager/shared";

const EMPTY_CURRENT_ITEM: CurrentItem = {
  name: "",
  price: "",
  discount: "",
  quantity: "1",
  categoryId: "",
};

export function useExpenseItems() {
  const [items, setItems] = useState<ExpenseItem[]>([]);
  const [currentItem, setCurrentItem] = useState<CurrentItem>({ ...EMPTY_CURRENT_ITEM });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [itemErrors, setItemErrors] = useState<Record<string, string>>({});

  const handleAddItem = () => {
    const errors: Record<string, string> = {};

    if (!currentItem.name?.trim()) errors.name = "Please enter item name";
    if (!currentItem.price || parseFloat(currentItem.price) <= 0) errors.price = "Please enter a valid price";
    if (!currentItem.categoryId) errors.categoryId = "Please select an item category";

    if (Object.keys(errors).length > 0) {
      setItemErrors(errors);
      return;
    }
    setItemErrors({});

    const newItem: ExpenseItem = {
      name: currentItem.name,
      price: parseFloat(currentItem.price),
      discount: currentItem.discount ? parseFloat(currentItem.discount) : 0,
      quantity: parseFloat(currentItem.quantity) || 1,
      categoryId: currentItem.categoryId,
      fromReceipt: currentItem.fromReceipt,
    };

    if (editingIndex !== null) {
      const newItems = [...items];
      newItems[editingIndex] = newItem;
      setItems(newItems);
      setEditingIndex(null);
    } else {
      setItems([...items, newItem]);
    }

    setCurrentItem({ ...EMPTY_CURRENT_ITEM });
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleEditItem = (index: number) => {
    const item = items[index];
    setCurrentItem({
      name: item.name,
      price: item.price.toString(),
      discount: item.discount > 0 ? item.discount.toString() : "",
      quantity: item.quantity.toString(),
      categoryId: item.categoryId,
      fromReceipt: item.fromReceipt,
    });
    setEditingIndex(index);
    setItemErrors({});
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setCurrentItem({ ...EMPTY_CURRENT_ITEM });
    setItemErrors({});
  };

  return {
    items,
    currentItem,
    editingIndex,
    itemErrors,
    setItems,
    setCurrentItem,
    handleAddItem,
    handleRemoveItem,
    handleEditItem,
    cancelEdit,
  };
}
