"use client";

import { useState } from "react";
import { GlassCard } from "@/components/glass/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  onUpdateStoreItem: (storeItemId: string, data: { price?: number; isDiscounted?: boolean }) => void;
  isUpdatingStoreItem: boolean;
  onCreateDiscount: (storeItemId: string, discount: number) => void;
  isCreatingDiscount: boolean;
  onEndDiscount: (storeItemId: string, discountId: string) => void;
  isEndingDiscount: boolean;
  activeDiscounts: Record<string, { id: string; discount: number }>;
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
  onUpdateStoreItem,
  isUpdatingStoreItem,
  onCreateDiscount,
  isCreatingDiscount,
  onEndDiscount,
  isEndingDiscount,
  activeDiscounts,
}: StoreDetailProps) {
  const [name, setName] = useState(store.name);
  const [location, setLocation] = useState(store.location);
  const isDirty = name !== store.name || location !== store.location;

  const [discountStoreItemId, setDiscountStoreItemId] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState("");

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
                <StoreItemRow
                  key={si.id}
                  storeItem={si}
                  onDeleteStoreItem={onDeleteStoreItem}
                  deletingStoreItemId={deletingStoreItemId}
                  onUpdateStoreItem={onUpdateStoreItem}
                  isUpdatingStoreItem={isUpdatingStoreItem}
                  activeDiscount={activeDiscounts[si.id]}
                  onStartDiscount={(storeItemId) => {
                    setDiscountStoreItemId(storeItemId);
                    setDiscountAmount("");
                  }}
                  onEndDiscount={onEndDiscount}
                  isEndingDiscount={isEndingDiscount}
                />
              ))}
            </div>
          )}
        </div>
      </GlassCard>

      <Dialog
        open={discountStoreItemId !== null}
        onOpenChange={(open) => { if (!open) setDiscountStoreItemId(null); }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Discount</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Discount Amount</Label>
            <Input
              type="number"
              min="0.01"
              step="0.01"
              value={discountAmount}
              onChange={(e) => setDiscountAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDiscountStoreItemId(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (discountStoreItemId && discountAmount) {
                  onCreateDiscount(discountStoreItemId, parseFloat(discountAmount));
                  setDiscountStoreItemId(null);
                }
              }}
              loading={isCreatingDiscount}
              disabled={!discountAmount || parseFloat(discountAmount) < 0.01}
            >
              Add Discount
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

function StoreItemRow({
  storeItem,
  onDeleteStoreItem,
  deletingStoreItemId,
  onUpdateStoreItem,
  isUpdatingStoreItem,
  activeDiscount,
  onStartDiscount,
  onEndDiscount,
  isEndingDiscount,
}: {
  storeItem: StoreItemResponseDto;
  onDeleteStoreItem: (storeItemId: string) => void;
  deletingStoreItemId: string | null;
  onUpdateStoreItem: (storeItemId: string, data: { price?: number; isDiscounted?: boolean }) => void;
  isUpdatingStoreItem: boolean;
  activeDiscount?: { id: string; discount: number };
  onStartDiscount: (storeItemId: string) => void;
  onEndDiscount: (storeItemId: string, discountId: string) => void;
  isEndingDiscount: boolean;
}) {
  const [editingPrice, setEditingPrice] = useState(false);
  const [priceValue, setPriceValue] = useState(storeItem.price.toFixed(2));

  const handlePriceSave = () => {
    const parsed = parseFloat(priceValue);
    if (!isNaN(parsed) && parsed >= 0 && parsed !== storeItem.price) {
      onUpdateStoreItem(storeItem.id, { price: parsed });
    }
    setEditingPrice(false);
  };

  return (
    <div className="flex items-center justify-between rounded-xl border border-border p-3">
      <div>
        <p className="text-sm font-medium text-text">{storeItem.name}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <DollarSign className="h-3 w-3 text-text-secondary" />
          {editingPrice ? (
            <Input
              type="number"
              min="0"
              step="0.01"
              value={priceValue}
              onChange={(e) => setPriceValue(e.target.value)}
              onBlur={handlePriceSave}
              onKeyDown={(e) => {
                if (e.key === "Enter") handlePriceSave();
                if (e.key === "Escape") {
                  setPriceValue(storeItem.price.toFixed(2));
                  setEditingPrice(false);
                }
              }}
              className="h-7 w-20 text-sm"
              autoFocus
            />
          ) : (
            <button
              type="button"
              className="text-sm font-medium text-text hover:text-primary transition-colors cursor-pointer"
              onClick={() => {
                setPriceValue(storeItem.price.toFixed(2));
                setEditingPrice(true);
              }}
              title="Click to edit price"
            >
              {storeItem.price.toFixed(2)}
            </button>
          )}
        </div>
        {storeItem.isDiscounted && activeDiscount ? (
          <button
            type="button"
            onClick={() => onEndDiscount(storeItem.id, activeDiscount.id)}
            disabled={isEndingDiscount}
            title="Click to end discount"
          >
            <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-error/20 transition-colors">
              <Percent className="h-3 w-3 mr-1" />
              -{activeDiscount.discount.toFixed(2)}
            </Badge>
          </button>
        ) : !storeItem.isDiscounted ? (
          <button
            type="button"
            onClick={() => onStartDiscount(storeItem.id)}
            title="Add discount"
          >
            <Badge variant="outline" className="text-xs cursor-pointer hover:bg-primary/10 transition-colors">
              <Percent className="h-3 w-3 mr-1" />
              Add
            </Badge>
          </button>
        ) : (
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
                Remove &quot;{storeItem.name}&quot;?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This will remove the price link between this store and the item.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDeleteStoreItem(storeItem.id)}
                disabled={deletingStoreItemId === storeItem.id}
                className="bg-error hover:bg-error/90"
              >
                {deletingStoreItemId === storeItem.id ? "Removing..." : "Remove"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
