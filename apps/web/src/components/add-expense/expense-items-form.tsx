"use client";

import { Plus, Check, X } from "lucide-react";
import type { CurrentItem, Category } from "@mmoneymanager/shared";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExpenseItemRow } from "./expense-item-row";
import type { ExpenseItem } from "@mmoneymanager/shared";

interface ExpenseItemsFormProps {
  items: ExpenseItem[];
  currentItem: CurrentItem;
  itemCategories: Category[];
  editingIndex: number | null;
  itemErrors: Record<string, string>;
  onCurrentItemChange: (item: CurrentItem) => void;
  onAddItem: () => void;
  onEditItem: (index: number) => void;
  onCancelEdit: () => void;
  onRemoveItem: (index: number) => void;
}

export function ExpenseItemsForm({
  items,
  currentItem,
  itemCategories,
  editingIndex,
  itemErrors,
  onCurrentItemChange,
  onAddItem,
  onEditItem,
  onCancelEdit,
  onRemoveItem,
}: ExpenseItemsFormProps) {
  return (
    <div className="space-y-4">
      {items.length > 0 && (
        <div className="space-y-2">
          <Label>Items ({items.length})</Label>
          <div className="space-y-2">
            {items.map((item, i) => (
              <ExpenseItemRow
                key={i}
                item={item}
                index={i}
                onEdit={onEditItem}
                onRemove={onRemoveItem}
              />
            ))}
          </div>
        </div>
      )}

      <div className="border border-border rounded-lg p-4 space-y-3">
        <Label>{editingIndex !== null ? "Edit Item" : "Add Item"}</Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Input
              placeholder="Item name"
              value={currentItem.name}
              onChange={(e) => onCurrentItemChange({ ...currentItem, name: e.target.value })}
            />
            {itemErrors.name && <p className="text-xs text-error mt-1">{itemErrors.name}</p>}
          </div>
          <div>
            <Input
              type="number"
              placeholder="Price"
              value={currentItem.price}
              onChange={(e) => onCurrentItemChange({ ...currentItem, price: e.target.value })}
              step="0.01"
              min="0"
            />
            {itemErrors.price && <p className="text-xs text-error mt-1">{itemErrors.price}</p>}
          </div>
          <div>
            <Input
              type="number"
              placeholder="Quantity"
              value={currentItem.quantity}
              onChange={(e) => onCurrentItemChange({ ...currentItem, quantity: e.target.value })}
              step="0.1"
              min="0.1"
            />
          </div>
          <div>
            <Input
              type="number"
              placeholder="Discount (optional)"
              value={currentItem.discount}
              onChange={(e) => onCurrentItemChange({ ...currentItem, discount: e.target.value })}
              step="0.01"
              min="0"
            />
          </div>
          <div>
            <Select
              value={currentItem.categoryId}
              onValueChange={(value) => onCurrentItemChange({ ...currentItem, categoryId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {itemCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {itemErrors.categoryId && <p className="text-xs text-error mt-1">{itemErrors.categoryId}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={onAddItem} className="flex-1">
            {editingIndex !== null ? <Check className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            {editingIndex !== null ? "Update" : "Add Item"}
          </Button>
          {editingIndex !== null && (
            <Button variant="outline" onClick={onCancelEdit}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
