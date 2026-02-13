"use client";

import { useState, useEffect } from "react";
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

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialName: string;
  onSubmit: (name: string, isConnectedToStore: boolean) => void;
  isLoading: boolean;
}

export function AddCategoryDialog({
  open,
  onOpenChange,
  initialName,
  onSubmit,
  isLoading,
}: AddCategoryDialogProps) {
  const [name, setName] = useState(initialName);
  const [isConnectedToStore, setIsConnectedToStore] = useState(false);

  useEffect(() => { setName(initialName); }, [initialName]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Category</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Category Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => onSubmit(name, isConnectedToStore)}
            loading={isLoading}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
