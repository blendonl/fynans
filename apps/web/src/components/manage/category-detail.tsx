"use client";

import { useState } from "react";
import { GlassCard } from "@/components/glass/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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

interface CategoryDetailProps {
  category: { id: string; name: string; parentId?: string | null; isConnectedToStore?: boolean };
  entityType: "expense" | "item" | "income";
  onUpdate: (data: { name?: string }) => void;
  isUpdating: boolean;
  onDelete: () => void;
  isDeleting: boolean;
}

export function CategoryDetail({
  category,
  entityType,
  onUpdate,
  isUpdating,
  onDelete,
  isDeleting,
}: CategoryDetailProps) {
  const [name, setName] = useState(category.name);
  const isDirty = name !== category.name;

  const typeLabel =
    entityType === "expense"
      ? "Expense Category"
      : entityType === "item"
        ? "Item Category"
        : "Income Category";

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
            {category.parentId && (
              <p className="text-xs text-text-secondary">
                Parent ID: {category.parentId}
              </p>
            )}
            <Button
              onClick={() => onUpdate({ name })}
              loading={isUpdating}
              disabled={!isDirty || !name.trim()}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="p-6">
          <h3 className="text-sm font-semibold text-error mb-2">Danger Zone</h3>
          <p className="text-sm text-text-secondary mb-4">
            Deleting this category cannot be undone. It will fail if it still has subcategories or is referenced by other records.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">Delete {typeLabel}</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete &quot;{category.name}&quot;?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete this {typeLabel.toLowerCase()}.
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
