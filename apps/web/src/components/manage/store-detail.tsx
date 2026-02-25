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
import type { StoreItemResponseDto } from "@/api/generated/model";
import { Package, DollarSign, Percent } from "lucide-react";

interface StoreDetailProps {
  store: { id: string; name: string; location: string };
  storeItems: StoreItemResponseDto[];
  isLoadingItems: boolean;
  onUpdate: (data: { name?: string; location?: string }) => void;
  isUpdating: boolean;
  onDelete: () => void;
  isDeleting: boolean;
  onDeleteStoreItem: (storeItemId: string) => void;
  deletingStoreItemId: string | null;
}

export function StoreDetail({
  store,
  storeItems,
  isLoadingItems,
  onUpdate,
  isUpdating,
  onDelete,
  isDeleting,
  onDeleteStoreItem,
  deletingStoreItemId,
}: StoreDetailProps) {
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
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-4 w-4 text-text-secondary" />
            <h3 className="text-sm font-semibold text-text">
              Items at this Store
            </h3>
            {!isLoadingItems && (
              <Badge variant="secondary">{storeItems.length}</Badge>
            )}
          </div>
          {isLoadingItems ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 rounded-xl bg-surface-variant skeleton-shimmer"
                />
              ))}
            </div>
          ) : storeItems.length === 0 ? (
            <p className="text-sm text-text-secondary">
              No items linked to this store yet.
            </p>
          ) : (
            <div className="space-y-3">
              {storeItems.map((si) => (
                <div
                  key={si.id}
                  className="flex items-center justify-between rounded-xl border border-border p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-text">{si.name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-text-secondary" />
                      <span className="text-sm font-medium text-text">
                        {si.price.toFixed(2)}
                      </span>
                    </div>
                    {si.isDiscounted && (
                      <Badge variant="secondary" className="text-xs">
                        <Percent className="h-3 w-3 mr-1" />
                        Discounted
                      </Badge>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-error h-7 px-2"
                        >
                          Remove
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Remove &quot;{si.name}&quot;?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove the price link between this store
                            and the item.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDeleteStoreItem(si.id)}
                            disabled={deletingStoreItemId === si.id}
                            className="bg-error hover:bg-error/90"
                          >
                            {deletingStoreItemId === si.id ? "Removing..." : "Remove"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </GlassCard>

      <GlassCard>
        <div className="p-6">
          <h3 className="text-sm font-semibold text-error mb-2">Danger Zone</h3>
          <p className="text-sm text-text-secondary mb-4">
            Deleting this store cannot be undone. It will fail if the store still
            has items or expenses.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                Delete Store
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Delete &quot;{store.name}&quot;?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete this
                  store.
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
