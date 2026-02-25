"use client";

import { useState, useMemo } from "react";
import { GlassCard } from "@/components/glass/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
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
import type { ItemDetailResponseDto, ItemStoreLinkDto } from "@/api/generated/model";
import { Store, DollarSign, Percent, Plus } from "lucide-react";

interface StoreOption {
  id: string;
  name: string;
  location: string;
}

interface ItemDetailProps {
  item: ItemDetailResponseDto;
  itemCategories: Array<{ id: string; name: string }>;
  stores: StoreOption[];
  onUpdate: (data: { name: string; categoryId: string }) => void;
  isUpdating: boolean;
  onDelete: () => void;
  isDeleting: boolean;
  onDeleteStoreItem: (storeItemId: string) => void;
  deletingStoreItemId: string | null;
  onCreateCategory: (name: string) => void;
  isCreatingCategory: boolean;
  onCreateStoreLink: (storeId: string, price: number) => void;
  isCreatingStoreLink: boolean;
  onCreateStore: (name: string, location: string) => void;
  isCreatingStore: boolean;
  onUpdateStoreItem: (storeItemId: string, data: { price?: number; isDiscounted?: boolean }) => void;
  isUpdatingStoreItem: boolean;
  onCreateDiscount: (storeItemId: string, discount: number) => void;
  isCreatingDiscount: boolean;
  onEndDiscount: (storeItemId: string, discountId: string) => void;
  isEndingDiscount: boolean;
  activeDiscounts: Record<string, { id: string; discount: number }>;
}

export function ItemDetail({
  item,
  itemCategories,
  stores,
  onUpdate,
  isUpdating,
  onDelete,
  isDeleting,
  onDeleteStoreItem,
  deletingStoreItemId,
  onCreateCategory,
  isCreatingCategory,
  onCreateStoreLink,
  isCreatingStoreLink,
  onCreateStore,
  isCreatingStore,
  onUpdateStoreItem,
  isUpdatingStoreItem,
  onCreateDiscount,
  isCreatingDiscount,
  onEndDiscount,
  isEndingDiscount,
  activeDiscounts,
}: ItemDetailProps) {
  const [name, setName] = useState(item.name);
  const [categoryId, setCategoryId] = useState(item.categoryId);
  const isDirty = name !== item.name || categoryId !== item.categoryId;

  const [addStoreOpen, setAddStoreOpen] = useState(false);
  const [newStoreDialogOpen, setNewStoreDialogOpen] = useState(false);
  const [newStoreName, setNewStoreName] = useState("");
  const [newStoreLocation, setNewStoreLocation] = useState("");
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState("");

  const [discountStoreItemId, setDiscountStoreItemId] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState("");

  const categoryOptions: ComboboxOption[] = useMemo(
    () => itemCategories.map((cat) => ({ value: cat.id, label: cat.name })),
    [itemCategories]
  );

  const selectedCategory = itemCategories.find((c) => c.id === categoryId);

  const storeOptions: ComboboxOption[] = useMemo(() => {
    const linkedStoreIds = new Set(item.stores.map((s) => s.storeId));
    return stores
      .filter((s) => !linkedStoreIds.has(s.id))
      .map((s) => ({ value: s.id, label: s.name, sublabel: s.location }));
  }, [stores, item.stores]);

  const selectedStore = stores.find((s) => s.id === selectedStoreId);

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
              <Label>Category</Label>
              <Combobox
                options={categoryOptions}
                value={categoryId}
                displayValue={selectedCategory?.name}
                onChange={setCategoryId}
                onClear={() => setCategoryId(item.categoryId)}
                onCreateNew={onCreateCategory}
                placeholder="Search categories..."
                isLoading={isCreatingCategory}
                showAllOnFocus
              />
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-text-secondary" />
              <h3 className="text-sm font-semibold text-text">
                Available in Stores
              </h3>
              <Badge variant="secondary">{item.stores.length}</Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAddStoreOpen(true)}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Store
            </Button>
          </div>
          {item.stores.length === 0 ? (
            <p className="text-sm text-text-secondary">
              This item is not linked to any stores yet.
            </p>
          ) : (
            <div className="space-y-3">
              {item.stores.map((store) => (
                <StoreItemRow
                  key={store.storeItemId}
                  store={store}
                  onDeleteStoreItem={onDeleteStoreItem}
                  deletingStoreItemId={deletingStoreItemId}
                  onUpdateStoreItem={onUpdateStoreItem}
                  isUpdatingStoreItem={isUpdatingStoreItem}
                  activeDiscount={activeDiscounts[store.storeItemId]}
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

      <Dialog open={addStoreOpen} onOpenChange={setAddStoreOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link to Store</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Store</Label>
              <Combobox
                options={storeOptions}
                value={selectedStoreId}
                displayValue={selectedStore?.name}
                onChange={setSelectedStoreId}
                onClear={() => setSelectedStoreId(null)}
                onCreateNew={(storeName) => {
                  setNewStoreName(storeName);
                  setNewStoreLocation("");
                  setNewStoreDialogOpen(true);
                }}
                placeholder="Search stores..."
                showAllOnFocus
              />
            </div>
            <div className="space-y-2">
              <Label>Price</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddStoreOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedStoreId && newPrice) {
                  onCreateStoreLink(selectedStoreId, parseFloat(newPrice));
                  setAddStoreOpen(false);
                  setSelectedStoreId(null);
                  setNewPrice("");
                }
              }}
              loading={isCreatingStoreLink}
              disabled={!selectedStoreId || !newPrice || parseFloat(newPrice) < 0}
            >
              Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={newStoreDialogOpen} onOpenChange={setNewStoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Store</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Store Name</Label>
              <Input
                value={newStoreName}
                onChange={(e) => setNewStoreName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={newStoreLocation}
                onChange={(e) => setNewStoreLocation(e.target.value)}
                placeholder="Store location"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewStoreDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                onCreateStore(newStoreName, newStoreLocation);
                setNewStoreDialogOpen(false);
              }}
              loading={isCreatingStore}
              disabled={!newStoreName.trim() || !newStoreLocation.trim()}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

function StoreItemRow({
  store,
  onDeleteStoreItem,
  deletingStoreItemId,
  onUpdateStoreItem,
  isUpdatingStoreItem,
  activeDiscount,
  onStartDiscount,
  onEndDiscount,
  isEndingDiscount,
}: {
  store: ItemStoreLinkDto;
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
  const [priceValue, setPriceValue] = useState(store.price.toFixed(2));

  const handlePriceSave = () => {
    const parsed = parseFloat(priceValue);
    if (!isNaN(parsed) && parsed >= 0 && parsed !== store.price) {
      onUpdateStoreItem(store.storeItemId, { price: parsed });
    }
    setEditingPrice(false);
  };

  return (
    <div className="flex items-center justify-between rounded-xl border border-border p-3">
      <div className="space-y-1">
        <p className="text-sm font-medium text-text">{store.storeName}</p>
        <p className="text-xs text-text-secondary">{store.storeLocation}</p>
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
                  setPriceValue(store.price.toFixed(2));
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
                setPriceValue(store.price.toFixed(2));
                setEditingPrice(true);
              }}
              title="Click to edit price"
            >
              {store.price.toFixed(2)}
            </button>
          )}
        </div>
        {store.isDiscounted && activeDiscount ? (
          <button
            type="button"
            onClick={() => onEndDiscount(store.storeItemId, activeDiscount.id)}
            disabled={isEndingDiscount}
            title="Click to end discount"
          >
            <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-error/20 transition-colors">
              <Percent className="h-3 w-3 mr-1" />
              -{activeDiscount.discount.toFixed(2)}
            </Badge>
          </button>
        ) : !store.isDiscounted ? (
          <button
            type="button"
            onClick={() => onStartDiscount(store.storeItemId)}
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
  );
}
