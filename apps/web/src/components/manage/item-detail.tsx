"use client";

import { useState } from "react";
import { GlassCard } from "@/components/glass/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface ItemDetailProps {
  item: { id: string; name: string };
  onUpdate: (data: { name: string }) => void;
  isUpdating: boolean;
  onDelete: () => void;
  isDeleting: boolean;
}

export function ItemDetail({ item, onUpdate, isUpdating, onDelete, isDeleting }: ItemDetailProps) {
  const [name, setName] = useState(item.name);
  const isDirty = name !== item.name;

  return (
    <div className="space-y-6">
      <GlassCard>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-text mb-4">{item.name}</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="item-name">Name</Label>
              <Input
                id="item-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
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
            Deleting this item cannot be undone. It will fail if the item is still referenced by store items.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">Delete Item</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete &quot;{item.name}&quot;?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete this item.
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
