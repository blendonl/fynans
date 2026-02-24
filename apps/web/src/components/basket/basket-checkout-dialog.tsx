"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CategorySelector } from "@/components/add-expense/category-selector";
import { StoreSelector } from "@/components/add-expense/store-selector";
import { useCategories } from "@/hooks/use-categories";
import { useStores } from "@/hooks/use-stores";
import { useStoreItemPrices } from "@/hooks/use-store-item-prices";
import { aiControllerSuggestCategory } from "@/api/generated/endpoints/ai/ai";
import { formatCurrency } from "@/utils/currency";
import type { BasketItem, Category, Store } from "@/types";
import { cn } from "@/lib/utils";

export interface CheckoutLineItem {
  id: string;
  name: string;
  price: number | null;
  quantity: number;
  categoryId?: string;
}

interface ItemCategorySuggestion {
  categoryId: string;
  categoryName: string;
}

interface BasketCheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checkedItems: BasketItem[];
  onConfirm: (params: {
    categoryId: string;
    storeId?: string;
    lineItems: CheckoutLineItem[];
  }) => void;
  isLoading: boolean;
}

export function BasketCheckoutDialog({
  open,
  onOpenChange,
  checkedItems,
  onConfirm,
  isLoading,
}: BasketCheckoutDialogProps) {
  const [categorySearch, setCategorySearch] = useState("");
  const [storeSearch, setStoreSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [lineItems, setLineItems] = useState<CheckoutLineItem[]>([]);

  const [expenseCategoryLoading, setExpenseCategoryLoading] = useState(false);
  const [itemCategoryMap, setItemCategoryMap] = useState<Record<string, ItemCategorySuggestion>>({});
  const [itemCategoryLoading, setItemCategoryLoading] = useState(false);
  const abortRef = useRef<AbortController | undefined>(undefined);

  useEffect(() => {
    if (!open) {
      abortRef.current?.abort();
      return;
    }

    setLineItems(
      checkedItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        categoryId: item.categoryId ?? undefined,
      }))
    );
    setSelectedStore(null);
    setSelectedCategory(null);
    setItemCategoryMap({});

    const existingMap: Record<string, ItemCategorySuggestion> = {};
    for (const item of checkedItems) {
      if (item.categoryId && item.categoryName) {
        existingMap[item.id] = {
          categoryId: item.categoryId,
          categoryName: item.categoryName,
        };
      }
    }
    setItemCategoryMap(existingMap);

    const names = checkedItems.map((i) => i.name);
    if (names.length === 0) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setExpenseCategoryLoading(true);
    aiControllerSuggestCategory(
      { type: "expense", itemNames: names } as Parameters<typeof aiControllerSuggestCategory>[0],
      { signal: controller.signal },
    )
      .then((res) => {
        if (controller.signal.aborted) return;
        const catId = res.data.categoryId as unknown as string | null;
        const catName = res.data.categoryName as unknown as string | null;
        if (catId && catName) {
          setSelectedCategory({
            id: catId,
            name: catName,
          } as Category);
          toast.info(`Category auto-suggested: ${catName}`);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!controller.signal.aborted) {
          setExpenseCategoryLoading(false);
        }
      });

    const newItems = checkedItems.filter((item) => !item.categoryId);
    if (newItems.length > 0) {
      setItemCategoryLoading(true);
      Promise.allSettled(
        newItems.map(async (item) => {
          const res = await aiControllerSuggestCategory(
            { type: "item", itemNames: [item.name] } as Parameters<typeof aiControllerSuggestCategory>[0],
            { signal: controller.signal },
          );
          return { itemId: item.id, res: res.data };
        })
      ).then((results) => {
        if (controller.signal.aborted) return;
        const map: Record<string, ItemCategorySuggestion> = {};
        for (const result of results) {
          if (result.status === "fulfilled") {
            const { itemId, res } = result.value;
            const catId = res.categoryId as unknown as string | null;
            const catName = res.categoryName as unknown as string | null;
            if (catId && catName) {
              map[itemId] = {
                categoryId: catId,
                categoryName: catName,
              };
            }
          }
        }
        setItemCategoryMap((prev) => ({ ...prev, ...map }));
        setLineItems((prev) =>
          prev.map((li) => {
            const suggestion = map[li.id];
            return suggestion
              ? { ...li, categoryId: suggestion.categoryId }
              : li;
          })
        );
        setItemCategoryLoading(false);
      });
    }

  }, [open]);

  const {
    categories,
    itemCategories,
    isLoading: categoriesLoading,
    fetchNextCategoryPage,
    hasNextCategoryPage,
    isFetchingNextCategoryPage,
    createCategory,
  } = useCategories(categorySearch);

  const {
    stores,
    isLoading: storesLoading,
    fetchNextPage: fetchNextStore,
    hasNextPage: hasNextStore,
    isFetchingNextPage: isFetchingNextStore,
    createStore,
  } = useStores(storeSearch);

  const { priceMap } = useStoreItemPrices(selectedStore?.id ?? null);

  useEffect(() => {
    if (!selectedStore || priceMap.size === 0) return;
    setLineItems((prev) =>
      prev.map((li) => {
        const storePrice = priceMap.get(li.name.toLowerCase().trim());
        return storePrice !== undefined ? { ...li, price: storePrice } : li;
      })
    );
  }, [selectedStore, priceMap]);

  const updateLineItem = (id: string, patch: Partial<CheckoutLineItem>) => {
    setLineItems((prev) =>
      prev.map((li) => (li.id === id ? { ...li, ...patch } : li))
    );
  };

  const total = lineItems.reduce(
    (sum, li) => sum + (li.price ?? 0) * li.quantity,
    0
  );
  const itemsWithoutPrice = lineItems.filter(
    (li) => li.price === null || li.price === undefined
  );
  const canConfirm = !!selectedCategory && itemsWithoutPrice.length === 0;

  const handleConfirm = () => {
    if (!selectedCategory) {
      toast.error("Please select a category");
      return;
    }
    if (itemsWithoutPrice.length > 0) {
      toast.error("All items must have a price");
      return;
    }
    onConfirm({
      categoryId: selectedCategory.id,
      storeId: selectedStore?.id,
      lineItems,
    });
  };

  const getItemCategoryName = (li: CheckoutLineItem): string | null => {
    if (!li.categoryId) return null;
    const suggestion = itemCategoryMap[li.id];
    if (suggestion && suggestion.categoryId === li.categoryId) {
      return suggestion.categoryName;
    }
    const cat = itemCategories.find((c) => c.id === li.categoryId);
    return cat?.name ?? null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Expense</DialogTitle>
          <DialogDescription>
            {lineItems.length} item{lineItems.length !== 1 ? "s" : ""}
            {itemsWithoutPrice.length === 0 && ` · ${formatCurrency(total)}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <StoreSelector
            stores={stores}
            selectedStore={selectedStore}
            onSelect={setSelectedStore}
            onClear={() => setSelectedStore(null)}
            onSearch={setStoreSearch}
            onCreateNew={(name) => {
              createStore.mutate(
                { name, location: "" },
                {
                  onSuccess: (store) => setSelectedStore(store),
                }
              );
            }}
            isLoading={storesLoading}
            onLoadMore={hasNextStore ? () => fetchNextStore() : undefined}
            hasMore={hasNextStore}
            isLoadingMore={isFetchingNextStore}
          />

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-text">Items</label>
              {itemCategoryLoading && (
                <div className="flex items-center gap-1.5 text-xs text-primary">
                  <Sparkles className="h-3 w-3 animate-pulse" />
                  <span>Categorizing...</span>
                </div>
              )}
            </div>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {lineItems.map((li) => {
                const categoryName = getItemCategoryName(li);
                return (
                  <div
                    key={li.id}
                    className="flex items-center gap-2 rounded-xl border border-border-light p-2.5"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-text truncate block">
                        {li.name}
                      </span>
                      {categoryName && (
                        <span className="flex items-center gap-1 text-[11px] text-primary mt-0.5">
                          <Sparkles className="h-2.5 w-2.5" />
                          {categoryName}
                        </span>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center gap-1">
                      <span className="text-[11px] text-text-disabled">qty</span>
                      <input
                        type="number"
                        step="0.5"
                        min="0.001"
                        value={String(li.quantity)}
                        onChange={(e) => {
                          const v = parseFloat(e.target.value);
                          if (!isNaN(v) && v > 0)
                            updateLineItem(li.id, { quantity: v });
                        }}
                        className="w-14 h-7 rounded-lg border border-border bg-surface px-2 text-sm text-right text-text focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>

                    <div className="shrink-0 flex items-center gap-1">
                      <span className="text-[11px] text-text-disabled">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="price"
                        value={
                          li.price !== null && li.price !== undefined
                            ? String(li.price)
                            : ""
                        }
                        onChange={(e) => {
                          const v =
                            e.target.value === ""
                              ? null
                              : parseFloat(e.target.value);
                          updateLineItem(li.id, {
                            price: v !== null && isNaN(v) ? null : v,
                          });
                        }}
                        className={`w-20 h-7 rounded-lg border bg-surface px-2 text-sm text-right text-text focus:outline-none focus:border-primary transition-colors ${
                          li.price === null
                            ? "border-warning/50"
                            : "border-border"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {itemsWithoutPrice.length > 0 && (
            <p className="text-sm text-error">
              {itemsWithoutPrice.length} item
              {itemsWithoutPrice.length !== 1 ? "s" : ""} still need a price.
              {!selectedStore && " Select a store to auto-fill prices."}
            </p>
          )}

          {selectedCategory && (
            <div
              className={cn(
                "flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm",
                "bg-surface-variant border border-border-light"
              )}
            >
              <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="text-text-secondary">Category:</span>
              <span className="font-semibold text-text">
                {selectedCategory.name}
              </span>
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className="ml-auto text-xs text-text-disabled hover:text-text-secondary transition-colors cursor-pointer"
              >
                Change
              </button>
            </div>
          )}
          {!selectedCategory && expenseCategoryLoading && (
            <div
              className={cn(
                "flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm",
                "bg-primary/5 border border-primary/15"
              )}
            >
              <Sparkles className="h-3.5 w-3.5 text-primary shrink-0 animate-pulse" />
              <span className="text-text-secondary">
                Detecting category...
              </span>
              <div className="ml-auto h-3 w-16 rounded bg-primary/15 animate-pulse" />
            </div>
          )}
          {!selectedCategory && !expenseCategoryLoading && (
            <CategorySelector
              categories={categories}
              selectedCategory={selectedCategory}
              onSelect={setSelectedCategory}
              onClear={() => setSelectedCategory(null)}
              onSearch={setCategorySearch}
              onCreateNew={(name) => {
                createCategory.mutate(
                  { name, isConnectedToStore: false },
                  {
                    onSuccess: (cat) => setSelectedCategory(cat as Category),
                  }
                );
              }}
              isLoading={categoriesLoading}
              onLoadMore={
                hasNextCategoryPage ? () => fetchNextCategoryPage() : undefined
              }
              hasMore={hasNextCategoryPage}
              isLoadingMore={isFetchingNextCategoryPage}
            />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            loading={isLoading}
            disabled={!canConfirm}
          >
            Confirm
            {itemsWithoutPrice.length === 0 && ` · ${formatCurrency(total)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
