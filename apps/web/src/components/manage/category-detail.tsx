"use client";

import { useState } from "react";
import { GlassCard } from "@/components/glass/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LinkedItemsList } from "./linked-items-list";

const NO_PARENT = "__none__";

interface CategoryDetailProps {
  category: {
    id: string;
    name: string;
    parentId?: string | null;
    isConnectedToStore?: boolean;
  };
  entityType: "expense" | "item" | "income";
  allCategories?: Array<{ id: string; name: string }>;
  categoryItems?: Array<{ id: string; name: string }>;
  isLoadingItems?: boolean;
  onUpdate: (data: {
    name?: string;
    parentId?: string | null;
    isConnectedToStore?: boolean;
  }) => void;
  isUpdating: boolean;
  onReassignItem?: (itemId: string, newCategoryId: string) => void;
  isReassigning?: boolean;
  onDelete: () => void;
  isDeleting: boolean;
}

export function CategoryDetail({
  category,
  entityType,
  allCategories,
  categoryItems,
  isLoadingItems,
  onUpdate,
  isUpdating,
  onReassignItem,
  isReassigning,
  onDelete,
  isDeleting,
}: CategoryDetailProps) {
  const [name, setName] = useState(category.name);
  const [parentId, setParentId] = useState<string>(
    category.parentId ?? NO_PARENT
  );
  const [isConnectedToStore, setIsConnectedToStore] = useState(
    category.isConnectedToStore ?? false
  );

  const effectiveParentId = parentId === NO_PARENT ? null : parentId;
  const originalParentId = category.parentId ?? null;

  const isDirty =
    name !== category.name ||
    effectiveParentId !== originalParentId ||
    (entityType === "expense" &&
      isConnectedToStore !== (category.isConnectedToStore ?? false));

  const typeLabel =
    entityType === "expense"
      ? "Expense Category"
      : entityType === "item"
        ? "Item Category"
        : "Income Category";

  const parentOptions = (allCategories ?? []).filter(
    (c) => c.id !== category.id
  );

  const handleSave = () => {
    const data: {
      name?: string;
      parentId?: string | null;
      isConnectedToStore?: boolean;
    } = {};
    if (name !== category.name) data.name = name;
    if (effectiveParentId !== originalParentId)
      data.parentId = effectiveParentId;
    if (
      entityType === "expense" &&
      isConnectedToStore !== (category.isConnectedToStore ?? false)
    )
      data.isConnectedToStore = isConnectedToStore;
    onUpdate(data);
  };

  return (
    <div className="space-y-6">
      <GlassCard>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-semibold text-text">{category.name}</h2>
            {entityType === "expense" && category.isConnectedToStore && (
              <Badge variant="secondary">Store-linked</Badge>
            )}
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Name</Label>
              <Input
                id="category-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            {allCategories && parentOptions.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="category-parent">Parent Category</Label>
                <Select value={parentId} onValueChange={setParentId}>
                  <SelectTrigger id="category-parent">
                    <SelectValue placeholder="No parent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_PARENT}>None</SelectItem>
                    {parentOptions.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {entityType === "expense" && (
              <div className="flex items-center gap-3">
                <Label htmlFor="connected-to-store">
                  Requires store selection
                </Label>
                <input
                  id="connected-to-store"
                  type="checkbox"
                  checked={isConnectedToStore}
                  onChange={(e) => setIsConnectedToStore(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
              </div>
            )}
            <Button
              onClick={handleSave}
              loading={isUpdating}
              disabled={!isDirty || !name.trim()}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </GlassCard>

      {entityType !== "income" &&
        categoryItems !== undefined &&
        onReassignItem && (
          <LinkedItemsList
            items={categoryItems}
            isLoading={isLoadingItems ?? false}
            currentCategoryId={category.id}
            allCategories={allCategories ?? []}
            onReassign={onReassignItem}
            isReassigning={isReassigning ?? false}
          />
        )}

      <GlassCard>
        <div className="p-6">
          <h3 className="text-sm font-semibold text-error mb-2">Danger Zone</h3>
          <p className="text-sm text-text-secondary mb-4">
            Deleting this category cannot be undone. It will fail if it still has
            subcategories or is referenced by other records.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                Delete {typeLabel}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Delete &quot;{category.name}&quot;?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete this{" "}
                  {typeLabel.toLowerCase()}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  disabled={isDeleting}
                  className="bg-error hover:bg-error/90"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </GlassCard>
    </div>
  );
}
