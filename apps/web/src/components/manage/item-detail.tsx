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
import type { ItemDetailResponseDto } from "@/api/generated/model";
import { Store, DollarSign, Percent } from "lucide-react";

interface ItemDetailProps {
  item: ItemDetailResponseDto;
  itemCategories: Array<{ id: string; name: string }>;
  onUpdate: (data: { name: string; categoryId: string }) => void;
  isUpdating: boolean;
  onDelete: () => void;
  isDeleting: boolean;
  onDeleteStoreItem: (storeItemId: string) => void;
  deletingStoreItemId: string | null;
}

export function ItemDetail({
  item,
  itemCategories,
  onUpdate,
  isUpdating,
  onDelete,
  isDeleting,
  onDeleteStoreItem,
  deletingStoreItemId,
}: ItemDetailProps) {
  const [name, setName] = useState(item.name);
  const [categoryId, setCategoryId] = useState(item.categoryId);
  const isDirty = name !== item.name || categoryId !== item.categoryId;

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
            <div className="space-y-2">
              <Label htmlFor="item-category">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger id="item-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {itemCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => onUpdate({ name, categoryId })}
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
          <div className="flex items-center gap-2 mb-4">
            <Store className="h-4 w-4 text-text-secondary" />
            <h3 className="text-sm font-semibold text-text">
              Available in Stores
            </h3>
            <Badge variant="secondary">{item.stores.length}</Badge>
          </div>
          {item.stores.length === 0 ? (
            <p className="text-sm text-text-secondary">
              This item is not linked to any stores yet.
            </p>
          ) : (
            <div className="space-y-3">
              {item.stores.map((store) => (
                <div
                  key={store.storeItemId}
                  className="flex items-center justify-between rounded-xl border border-border p-3"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-text">
                      {store.storeName}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {store.storeLocation}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-text-secondary" />
                      <span className="text-sm font-medium text-text">
                        {store.price.toFixed(2)}
                      </span>
                    </div>
                    {store.isDiscounted && (
                      <Badge variant="secondary" className="text-xs">
                        <Percent className="h-3 w-3 mr-1" />
                        Discounted
                      </Badge>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-error h-7 px-2">
                          Remove
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Remove from &quot;{store.storeName}&quot;?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove the price link between this item and
                            the store.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDeleteStoreItem(store.storeItemId)}
                            disabled={deletingStoreItemId === store.storeItemId}
                            className="bg-error hover:bg-error/90"
                          >
                            {deletingStoreItemId === store.storeItemId ? "Removing..." : "Remove"}
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
            Deleting this item cannot be undone. It will fail if the item is
            still referenced by store items.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                Delete Item
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Delete &quot;{item.name}&quot;?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete this
                  item.
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
