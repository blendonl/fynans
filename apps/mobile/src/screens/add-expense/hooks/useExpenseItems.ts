import { useState } from "react";
import { ExpenseItem, CurrentItem } from "../../../features/expenses/types";

const EMPTY_CURRENT_ITEM: CurrentItem = {
  name: "",
  price: "",
  discount: "",
  quantity: "1",
  categoryId: "",
};

export function useExpenseItems() {
  const [items, setItems] = useState<ExpenseItem[]>([]);
  const [currentItem, setCurrentItem] = useState<CurrentItem>({
    ...EMPTY_CURRENT_ITEM,
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [itemErrors, setItemErrors] = useState<Record<string, string>>({});
  const [lastRemovedItem, setLastRemovedItem] = useState<{
    item: ExpenseItem;
    index: number;
  } | null>(null);

  const handleAddItem = async (storeId?: string, saveToStore?: boolean) => {
    const errors: Record<string, string> = {};

    if (!currentItem.name?.trim()) {
      errors.name = "Please enter item name";
    }
    if (!currentItem.price || parseFloat(currentItem.price) <= 0) {
      errors.price = "Please enter a valid price";
    }
    if (!currentItem.categoryId) {
      errors.categoryId = "Please select an item category";
    }

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
    const removedItem = items[index];
    setLastRemovedItem({ item: removedItem, index });
    setItems(items.filter((_, i) => i !== index));
  };

  const undoRemoveItem = () => {
    if (!lastRemovedItem) return;
    const newItems = [...items];
    newItems.splice(lastRemovedItem.index, 0, lastRemovedItem.item);
    setItems(newItems);
    setLastRemovedItem(null);
  };

  const handleUpdateQuantity = (index: number, change: number) => {
    const newItems = [...items];
    const currentQty = newItems[index].quantity;
    const increment = Math.abs(change) < 1 ? 0.1 : 1;
    const newQuantity = currentQty + (change > 0 ? increment : -increment);

    newItems[index].quantity = parseFloat(Math.max(newQuantity, 0.1).toFixed(3));
    setItems(newItems);
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
    setEditingIndex(index);
    setItemErrors({});
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setCurrentItem({ ...EMPTY_CURRENT_ITEM });
    setItemErrors({});
  };

  const hasMissingCategory = (item: ExpenseItem): boolean => {
    return !item.categoryId || item.categoryId === "";
  };

  return {
    items,
    currentItem,
    editingIndex,
    itemErrors,
    lastRemovedItem,
    handleAddItem,
    setCurrentItem,
    handleRemoveItem,
    undoRemoveItem,
    handleUpdateQuantity,
    handleEditItem,
    cancelEdit,
    hasMissingCategory,
    setItems,
  };
}
