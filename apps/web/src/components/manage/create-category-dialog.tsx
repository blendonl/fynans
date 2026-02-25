"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type CategoryType = "expense" | "item" | "income";

interface CreateCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryType: CategoryType;
  onSubmit: (data: { name: string; isConnectedToStore?: boolean }) => void;
  isLoading: boolean;
}

const TITLES: Record<CategoryType, string> = {
  expense: "Create Expense Category",
  item: "Create Item Category",
  income: "Create Income Category",
};

export function CreateCategoryDialog({
  open,
  onOpenChange,
  categoryType,
  onSubmit,
  isLoading,
}: CreateCategoryDialogProps) {
  const [name, setName] = useState("");
  const [isConnectedToStore, setIsConnectedToStore] = useState(false);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      ...(categoryType === "expense" ? { isConnectedToStore } : {}),
    });
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      setName("");
      setIsConnectedToStore(false);
    }
    onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{TITLES[categoryType]}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Category Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category name"
            />
          </div>
          {categoryType === "expense" && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="connectedToStore"
                checked={isConnectedToStore}
                onChange={(e) => setIsConnectedToStore(e.target.checked)}
                className="rounded border-border"
              />
              <Label htmlFor="connectedToStore">Connected to store</Label>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={isLoading}
            disabled={!name.trim()}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
