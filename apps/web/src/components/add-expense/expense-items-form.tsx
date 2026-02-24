"use client";

import { useState, useMemo, useEffect, useRef, type ReactNode } from "react";
import { Plus, Check, X } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/currency";
import { calculateExpenseItemsTotal } from "@/utils/calculations";
import type { CurrentItem, Category, ExpenseItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { useStoreItems } from "@/hooks/use-store-items";
import { cn } from "@/lib/utils";
import { ItemCategorySelector } from "./item-category-selector";
import { ExpenseItemRow } from "./expense-item-row";

const UNITS = [
  { value: "", label: "Unit" },
  { value: "kg", label: "kg" },
  { value: "g", label: "g" },
  { value: "l", label: "L" },
  { value: "ml", label: "mL" },
  { value: "cl", label: "cL" },
] as const;

function UnitSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-1 flex-wrap">
      {UNITS.filter((u) => u.value !== "").map((unit) => (
        <button
          key={unit.value}
          type="button"
          onClick={() => onChange(value === unit.value ? "" : unit.value)}
          className={cn(
            "px-2.5 py-2 text-xs font-medium rounded-xl transition-all cursor-pointer min-h-12 flex items-center justify-center",
            value === unit.value
              ? "bg-primary/10 text-primary ring-1 ring-primary/20"
              : "bg-surface-variant text-text-secondary hover:text-text hover:bg-surface-variant/80 border border-border"
          )}
        >
          {unit.label}
        </button>
      ))}
    </div>
  );
}

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
  onQuickAddItem: (name: string, price: number, categoryId: string, size?: { value: number; unit: string }) => void;
  onQuantityChange: (index: number, quantity: number) => void;
  onCreateNewItemCategory: (name: string) => void;
  isLoadingCategories: boolean;
  borderless?: boolean;
  onItemNameChange?: (name: string) => void;
  itemCategoryAiSuggestion?: { categoryId: string; categoryName: string } | null;
  isItemCategoryAiLoading?: boolean;
  onAcceptItemCategoryAi?: () => void;
  onDismissItemCategoryAi?: () => void;
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
  borderless,
  onItemNameChange,
  itemCategoryAiSuggestion,
  isItemCategoryAiLoading,
  onAcceptItemCategoryAi,
  onDismissItemCategoryAi,
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

  // Auto-fill item category from AI suggestion
  const lastAutoFilledRef = useRef<string | null>(null);
  useEffect(() => {
    if (
      itemCategoryAiSuggestion &&
      !currentItem.categoryId &&
      isNewItem &&
      lastAutoFilledRef.current !== itemCategoryAiSuggestion.categoryId
    ) {
      const cat = itemCategories.find((c) => c.id === itemCategoryAiSuggestion.categoryId);
      if (cat) {
        onCurrentItemChange({ ...currentItem, categoryId: cat.id });
        lastAutoFilledRef.current = itemCategoryAiSuggestion.categoryId;
        onAcceptItemCategoryAi?.();
      }
    }
  }, [itemCategoryAiSuggestion, currentItem, isNewItem, itemCategories, onCurrentItemChange, onAcceptItemCategoryAi]);

  const isEditing = editingIndex !== null;
  const showAddFormFields = !isEditing && isNewItem;

  const itemOptions: ComboboxOption[] = useMemo(
    () =>
      storeItems.map((item) => ({
        value: item.id,
        label: item.sizes.length > 0
          ? `${item.name} · ${item.sizes.map((s) => `${s.value} ${s.unit}`).join(', ')}`
          : item.name,
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
    onItemNameChange?.(name);
  };

  const handleItemClear = () => {
    setSelectedItemId(null);
    setIsNewItem(false);
    onCurrentItemChange({ ...currentItem, name: "", categoryId: "" });
  };

  const total = calculateExpenseItemsTotal(items);

  const handleRemove = (index: number) => {
    const removed = onRemoveItem(index);
    toast("Item removed", {
      action: {
        label: "Undo",
        onClick: () => onInsertItem(index, removed),
      },
    });
  };

  const renderFormFields = (mode: "edit" | "add"): ReactNode => {
    const isEditMode = mode === "edit";
    const showCategorySelector = isEditMode || isNewItem;

    return (
      <div className="space-y-3 field-slide-down">
        {isEditMode && (
          <div>
            <Input
              type="text"
              placeholder="Item name"
              value={currentItem.name}
              onChange={(e) => onCurrentItemChange({ ...currentItem, name: e.target.value })}
              className="min-h-12"
              autoFocus
            />
            {itemErrors.name && <p className="text-xs text-error mt-1">{itemErrors.name}</p>}
          </div>
        )}
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
                step="any"
                min="0.001"
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
          <div className="sm:col-span-2 flex gap-3">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Size (e.g. 4)"
                value={currentItem.sizeValue ?? ""}
                onChange={(e) => onCurrentItemChange({ ...currentItem, sizeValue: e.target.value })}
                step="any"
                min="0.001"
                className="min-h-12"
              />
            </div>
            <div className="w-28">
              <UnitSelector
                value={currentItem.sizeUnit ?? ""}
                onChange={(unit) => onCurrentItemChange({ ...currentItem, sizeUnit: unit })}
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
                aiSuggestion={itemCategoryAiSuggestion}
                onAcceptSuggestion={onAcceptItemCategoryAi}
                onDismissSuggestion={onDismissItemCategoryAi}
                isSuggestionLoading={isItemCategoryAiLoading}
              />
              {itemErrors.categoryId && <p className="text-xs text-error mt-1">{itemErrors.categoryId}</p>}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button onClick={onAddItem} className="flex-1 h-11">
            {isEditMode ? <Check className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            {isEditMode ? "Update" : "Add Item"}
          </Button>
          {isEditMode && (
            <Button variant="outline" onClick={onCancelEdit} className="h-11">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <Label>Items{items.length > 0 && ` (${items.length})`}</Label>
      <div className={items.length > 0 && !borderless ? "border border-border rounded-2xl p-3 sm:p-4 space-y-3" : "space-y-3"}>
        {items.map((item, i) => {
          const isItemEditing = editingIndex === i;
          return (
            <div key={item.id ?? i}>
              <ExpenseItemRow
                item={item}
                index={i}
                isEditing={isItemEditing}
                onEdit={onEditItem}
                onRemove={handleRemove}
                onQuantityChange={onQuantityChange}
              />
              {isItemEditing && (
                <div className="px-3 pb-3 pt-2 sm:px-4 sm:pb-4 bg-surface-variant rounded-b-2xl border-t border-border/40">
                  {renderFormFields("edit")}
                </div>
              )}
            </div>
          );
        })}

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
                  onItemNameChange?.(search);
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

        {showAddFormFields && renderFormFields("add")}
      </div>
    </div>
  );
}
