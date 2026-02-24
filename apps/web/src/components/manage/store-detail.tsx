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

interface StoreDetailProps {
  store: { id: string; name: string; location: string };
  onUpdate: (data: { name?: string; location?: string }) => void;
  isUpdating: boolean;
  onDelete: () => void;
  isDeleting: boolean;
}

export function StoreDetail({ store, onUpdate, isUpdating, onDelete, isDeleting }: StoreDetailProps) {
  const [name, setName] = useState(store.name);
  const [location, setLocation] = useState(store.location);
  const isDirty = name !== store.name || location !== store.location;

  return (
    <div className="space-y-6">
      <GlassCard>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-text mb-4">{store.name}</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="store-name">Name</Label>
              <Input
                id="store-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-location">Location</Label>
              <Input
                id="store-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <Button
              onClick={() => onUpdate({ name, location })}
              loading={isUpdating}
              disabled={!isDirty || !name.trim() || !location.trim()}
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
            Deleting this store cannot be undone. It will fail if the store still has items or expenses.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">Delete Store</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete &quot;{store.name}&quot;?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete this store.
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
