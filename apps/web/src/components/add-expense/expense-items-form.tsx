"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, Check, X } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@fynans/shared";
import type { CurrentItem, Category, ExpenseItem } from "@fynans/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { useStoreItems } from "@/hooks/use-store-items";
import { ItemCategorySelector } from "./item-category-selector";
import { ExpenseItemRow } from "./expense-item-row";

interface ExpenseItemsFormProps {
  items: ExpenseItem[];
  currentItem: CurrentItem;
  itemCategories: Category[];
  editingIndex: number | null;
  itemErrors: Record<string, string>;
  storeId?: string;
  onCurrentItemChange: (item: CurrentItem) => void;
  onAddItem: () => void;
  onEditItem: (index: number) => void;
  onCancelEdit: () => void;
  onRemoveItem: (index: number) => ExpenseItem;
  onInsertItem: (index: number, item: ExpenseItem) => void;
  onQuickAddItem: (name: string, price: number, categoryId: string) => void;
  onQuantityChange: (index: number, quantity: number) => void;
  onCreateNewItemCategory: (name: string) => void;
  isLoadingCategories: boolean;
}

export function ExpenseItemsForm({
  items,
  currentItem,
  itemCategories,
  editingIndex,
  itemErrors,
  storeId,
  onCurrentItemChange,
  onAddItem,
  onEditItem,
  onCancelEdit,
  onRemoveItem,
  onInsertItem,
  onQuickAddItem,
  onQuantityChange,
  onCreateNewItemCategory,
  isLoadingCategories,
}: ExpenseItemsFormProps) {
  const [itemSearch, setItemSearch] = useState("");
  const [isNewItem, setIsNewItem] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [comboboxResetKey, setComboboxResetKey] = useState(0);

  const {
    items: storeItems,
    isLoading: storeLoading,
    fetchNextPage: fetchNextStoreItemsPage,
    hasNextPage: hasNextStoreItemsPage,
    isFetchingNextPage: isFetchingNextStoreItemsPage,
  } = useStoreItems(storeId, itemSearch);

  const selectedItemCategory = itemCategories.find((c) => c.id === currentItem.categoryId) || null;

  const isEditing = editingIndex !== null;
  const showFormFields = isEditing || isNewItem;

  const itemOptions: ComboboxOption[] = useMemo(
    () =>
      storeItems.map((item) => ({
        value: item.id,
        label: item.name,
        sublabel: formatCurrency(item.price),
      })),
    [storeItems]
  );

  useEffect(() => {
    if (!currentItem.name && !isEditing) {
      setIsNewItem(false);
      setSelectedItemId(null);
      setComboboxResetKey((k) => k + 1);
    }
  }, [currentItem.name, isEditing]);

  const handleItemSelect = (itemId: string) => {
    const item = storeItems.find((i) => i.id === itemId);
    if (!item) return;

    onQuickAddItem(item.name, item.price, item.categoryId);
    setSelectedItemId(null);
    setItemSearch("");
  };

  const handleItemCreateNew = (name: string) => {
    setIsNewItem(true);
    setSelectedItemId(null);
    onCurrentItemChange({ ...currentItem, name, categoryId: "" });
  };

  const handleItemClear = () => {
    setSelectedItemId(null);
    setIsNewItem(false);
    onCurrentItemChange({ ...currentItem, name: "", categoryId: "" });
  };

  const total = items.reduce(
    (sum, item) => sum + (item.price - item.discount) * item.quantity,
    0
  );

  const handleRemove = (index: number) => {
    const removed = onRemoveItem(index);
    toast("Item removed", {
      action: {
        label: "Undo",
        onClick: () => onInsertItem(index, removed),
      },
    });
  };

  const showCategorySelector = isEditing || isNewItem;

  return (
    <div className="space-y-3">
      <Label>Items{items.length > 0 && ` (${items.length})`}</Label>
      <div className={items.length > 0 ? "border border-border rounded-2xl p-3 sm:p-4 space-y-3" : "space-y-3"}>
        {items.map((item, i) => (
          <ExpenseItemRow
            key={i}
            item={item}
            index={i}
            onEdit={onEditItem}
            onRemove={handleRemove}
            onQuantityChange={onQuantityChange}
          />
        ))}

        {items.length > 0 && (
          <div className="flex justify-between items-center px-4 py-3 rounded-2xl bg-surface-variant">
            <span className="text-sm font-medium text-text-secondary">Total</span>
            <span className="text-base font-bold text-text tabular-nums">{formatCurrency(total)}</span>
          </div>
        )}

        {!isEditing && (
          <div>
            <Combobox
              key={comboboxResetKey}
              options={itemOptions}
              value={selectedItemId}
              displayValue={currentItem.name || undefined}
              onChange={handleItemSelect}
              onClear={handleItemClear}
              onSearchChange={(search) => {
                setItemSearch(search);
                if (isNewItem) {
                  onCurrentItemChange({ ...currentItem, name: search });
                }
              }}
              onCreateNew={isNewItem ? undefined : handleItemCreateNew}
              onLoadMore={() => fetchNextStoreItemsPage()}
              hasMore={hasNextStoreItemsPage}
              isLoadingMore={isFetchingNextStoreItemsPage}
              placeholder="+ Add item..."
              isLoading={storeLoading}
              showAllOnFocus
              className="min-h-12"
            />
            {itemErrors.name && <p className="text-xs text-error mt-1">{itemErrors.name}</p>}
          </div>
        )}

        {showFormFields && (
          <div className="space-y-3 field-slide-down">
            {/* Mobile: stack vertically. Desktop: grid */}
            <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3">
              <div>
                <Input
                  type="number"
                  placeholder="Price"
                  value={currentItem.price}
                  onChange={(e) => onCurrentItemChange({ ...currentItem, price: e.target.value })}
                  step="0.01"
                  min="0"
                  className="min-h-12"
                />
                {itemErrors.price && <p className="text-xs text-error mt-1">{itemErrors.price}</p>}
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="Qty"
                    value={currentItem.quantity}
                    onChange={(e) => onCurrentItemChange({ ...currentItem, quantity: e.target.value })}
                    step="0.1"
                    min="0.1"
                    className="min-h-12"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="Discount"
                    value={currentItem.discount}
                    onChange={(e) => onCurrentItemChange({ ...currentItem, discount: e.target.value })}
                    step="0.01"
                    min="0"
                    className="min-h-12"
                  />
                </div>
              </div>
              {showCategorySelector && (
                <div className="sm:col-span-2">
                  <ItemCategorySelector
                    itemCategories={itemCategories}
                    selectedCategory={selectedItemCategory}
                    onSelect={(cat) => onCurrentItemChange({ ...currentItem, categoryId: cat.id })}
                    onClear={() => onCurrentItemChange({ ...currentItem, categoryId: "" })}
                    onCreateNew={onCreateNewItemCategory}
                    isLoading={isLoadingCategories}
                  />
                  {itemErrors.categoryId && <p className="text-xs text-error mt-1">{itemErrors.categoryId}</p>}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={onAddItem} className="flex-1 h-11">
                {isEditing ? <Check className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                {isEditing ? "Update" : "Add Item"}
              </Button>
              {isEditing && (
                <Button variant="outline" onClick={onCancelEdit} className="h-11">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
