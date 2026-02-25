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
import { Combobox } from "@/components/ui/combobox";
import { useItemCategories } from "@/hooks/use-item-categories";

interface CreateItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string, categoryId: string) => void;
  isLoading: boolean;
}

export function CreateItemDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: CreateItemDialogProps) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const { itemCategories, isLoading: categoriesLoading, createItemCategory } = useItemCategories();

  const categoryOptions = itemCategories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  const selectedCategory = itemCategories.find((c) => c.id === categoryId);

  const handleSubmit = () => {
    if (name.trim() && categoryId) {
      onSubmit(name.trim(), categoryId);
    }
  };

  const handleCreateCategory = async (categoryName: string) => {
    try {
      const result = await createItemCategory.mutateAsync({ name: categoryName });
      setCategoryId(result.id);
    } catch {
      // handled by mutation onError
    }
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      setName("");
      setCategoryId(null);
    }
    onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Item</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Item name"
            />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Combobox
              options={categoryOptions}
              value={categoryId}
              displayValue={selectedCategory?.name}
              onChange={setCategoryId}
              onClear={() => setCategoryId(null)}
              onCreateNew={handleCreateCategory}
              placeholder="Search categories..."
              isLoading={categoriesLoading}
              showAllOnFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={isLoading}
            disabled={!name.trim() || !categoryId}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
