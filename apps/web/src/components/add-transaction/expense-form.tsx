"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { formatCurrency } from "@fynans/shared";
import type { Category, Store, ExpenseItem } from "@fynans/shared";
import { apiClient } from "@/lib/api-client";
import { useCategories } from "@/hooks/use-categories";
import { useStores } from "@/hooks/use-stores";
import { useExpenseItems } from "@/hooks/use-expense-items";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategorySelector } from "@/components/add-expense/category-selector";
import { StoreSelector } from "@/components/add-expense/store-selector";
import { ExpenseItemsForm } from "@/components/add-expense/expense-items-form";
import { FormProgress } from "@/components/add-expense/form-progress";
import { AddCategoryDialog } from "@/components/add-expense/add-category-dialog";
import { AddStoreDialog } from "@/components/add-expense/add-store-dialog";
import { AddItemCategoryDialog } from "@/components/add-expense/add-item-category-dialog";
import { AmountHero } from "./amount-hero";
import { DateTimePicker } from "./date-time-picker";
import { ReceiptScanArea } from "./receipt-scan-area";
import type { ProcessedReceiptResponse } from "@/hooks/use-receipt-scan";

function localNow() {
  return format(new Date(), "yyyy-MM-dd'T'HH:mm");
}

interface ExpenseFormProps {
  onSuccess: () => void;
  scope: "PERSONAL" | "FAMILY";
  familyId: string;
}

export function ExpenseForm({ onSuccess, scope, familyId }: ExpenseFormProps) {
  const [categorySearch, setCategorySearch] = useState("");
  const {
    categories,
    itemCategories,
    isLoading: categoriesLoading,
    fetchNextCategoryPage,
    hasNextCategoryPage,
    isFetchingNextCategoryPage,
    createCategory,
    createItemCategory,
  } = useCategories(categorySearch);
  const [storeSearch, setStoreSearch] = useState("");
  const {
    stores,
    isLoading: storesLoading,
    fetchNextPage: fetchNextStorePage,
    hasNextPage: hasNextStorePage,
    isFetchingNextPage: isFetchingNextStorePage,
    createStore,
  } = useStores(storeSearch);
  const expenseItems = useExpenseItems();

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isItemized, setIsItemized] = useState(false);
  const [simpleAmount, setSimpleAmount] = useState("");
  const [simpleNote, setSimpleNote] = useState("");
  const [recordedAt, setRecordedAt] = useState(localNow);
  const [hasScannedReceipt, setHasScannedReceipt] = useState(false);

  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showStoreDialog, setShowStoreDialog] = useState(false);
  const [newStoreName, setNewStoreName] = useState("");
  const [showItemCategoryDialog, setShowItemCategoryDialog] = useState(false);
  const [newItemCategoryName, setNewItemCategoryName] = useState("");

  const isGroceryExpense = selectedCategory?.isConnectedToStore === true;

  const itemsTotal = expenseItems.items.reduce(
    (sum: number, item: ExpenseItem) => sum + (item.price - item.discount) * item.quantity,
    0
  );

  const handleReceiptResult = (data: ProcessedReceiptResponse) => {
    if (!data.items || data.items.length === 0) {
      toast.warning("No items found in receipt");
      return;
    }

    if (data.confidence < 50) {
      toast.warning("Low confidence scan -- please review items carefully");
    }

    setIsItemized(true);
    setHasScannedReceipt(true);

    // Auto-select expense category from AI suggestion
    let autoSelectedCategory = selectedCategory;
    if (data.suggestedExpenseCategory && !selectedCategory) {
      const matchedCat = categories.find((c) => c.id === data.suggestedExpenseCategory!.id);
      if (matchedCat) {
        autoSelectedCategory = matchedCat;
        setSelectedCategory(matchedCat);
        toast.info(`Category auto-selected: ${matchedCat.name}`);
      }
    }

    if (data.store) {
      const match = stores.find((s) =>
        data.store!.id
          ? s.id === data.store!.id
          : s.name.toLowerCase() === data.store!.name.toLowerCase(),
      );
      if (match) setSelectedStore(match);
    }

    const fallbackCategoryId = autoSelectedCategory?.id || selectedCategory?.id || "";
    expenseItems.setItems(
      data.items.map((item) => ({
        name: item.name,
        price: item.price,
        discount: 0,
        quantity: item.quantity,
        categoryId: item.suggestedItemCategoryId || item.categoryId || fallbackCategoryId,
        fromReceipt: true,
      })),
    );

    if (data.recordedAt) {
      const parsed = new Date(data.recordedAt);
      if (!isNaN(parsed.getTime())) {
        setRecordedAt(format(parsed, "yyyy-MM-dd'T'HH:mm"));
      }
    }

    if (!autoSelectedCategory && !selectedCategory) {
      toast.info("Select a category to see scanned items");
    }

    const storeName = data.store?.name;
    toast.success(
      `Found ${data.items.length} item${data.items.length !== 1 ? "s" : ""}${storeName ? ` from ${storeName}` : ""}`,
    );
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      const items: { categoryId: string; itemName: string; itemPrice: number; discount: number; quantity: number }[] = isItemized
        ? expenseItems.items.map((item: ExpenseItem) => ({
            categoryId: item.categoryId,
            itemName: item.name,
            itemPrice: item.price,
            discount: item.discount,
            quantity: item.quantity,
          }))
        : [
            {
              categoryId: selectedCategory!.id,
              itemName: simpleNote.trim() || selectedCategory!.name,
              itemPrice: parseFloat(simpleAmount),
              discount: 0,
              quantity: 1,
            },
          ];

      await apiClient.post("/expenses", {
        categoryId: selectedCategory!.id,
        storeName: isGroceryExpense ? selectedStore?.name : undefined,
        storeLocation: isGroceryExpense ? selectedStore?.location : undefined,
        recordedAt: new Date(recordedAt).toISOString(),
        scope,
        familyId: scope === "FAMILY" ? familyId : null,
        items,
      });
    },
    onSuccess: () => {
      const total = isItemized ? itemsTotal : parseFloat(simpleAmount);
      toast.success(`Expense created: ${formatCurrency(total)}`);
      onSuccess();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create expense");
    },
  });

  const canSubmit = () => {
    if (!selectedCategory) return false;
    if (!isItemized) return simpleAmount !== "" && parseFloat(simpleAmount) > 0;
    return expenseItems.items.length > 0;
  };

  const validationMessage = () => {
    if (!selectedCategory) return "Select a category to continue";
    if (!isItemized && (!simpleAmount || parseFloat(simpleAmount) <= 0)) return "Enter an amount";
    if (isItemized && expenseItems.items.length === 0) return "Add at least one item";
    return null;
  };

  const progressSteps = [
    { label: "Category", completed: selectedCategory !== null, active: selectedCategory === null },
    ...(isGroceryExpense
      ? [{ label: "Store", completed: selectedStore !== null, active: selectedCategory !== null && !selectedStore }]
      : []),
    { label: "Items", completed: expenseItems.items.length > 0, active: selectedCategory !== null && expenseItems.items.length === 0 },
    { label: "Review", completed: false, active: canSubmit() },
  ];

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:gap-8">
        {/* Left panel — Amount & Receipt scan */}
        <div className="space-y-5 lg:w-72 lg:shrink-0 lg:sticky lg:top-6 lg:self-start">
          {!isItemized ? (
            <AmountHero
              value={simpleAmount}
              onChange={setSimpleAmount}
              type="expense"
              autoFocus={!!selectedCategory}
            />
          ) : (
            <AmountHero
              value={itemsTotal > 0 ? itemsTotal.toFixed(2) : ""}
              type="expense"
              readOnly
              sublabel={expenseItems.items.length > 0 ? `from ${expenseItems.items.length} item${expenseItems.items.length !== 1 ? "s" : ""}` : undefined}
            />
          )}

          <ReceiptScanArea
            onResult={handleReceiptResult}
            hasScanned={hasScannedReceipt}
          />
        </div>

        {/* Right panel — Form fields */}
        <div className="space-y-5 mt-5 lg:mt-0 flex-1 min-w-0">
          {/* Category */}
          <CategorySelector
            categories={categories}
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
            onClear={() => setSelectedCategory(null)}
            onSearch={setCategorySearch}
            onCreateNew={(name) => { setNewCategoryName(name); setShowCategoryDialog(true); }}
            isLoading={categoriesLoading}
            onLoadMore={() => fetchNextCategoryPage()}
            hasMore={hasNextCategoryPage}
            isLoadingMore={isFetchingNextCategoryPage}
          />

          {/* Phase 2: After category selected */}
          {selectedCategory && !isItemized && (
            <div className="space-y-4 field-slide-down">
              <div className="space-y-2">
                <Input
                  placeholder="Add a note (optional)"
                  value={simpleNote}
                  onChange={(e) => setSimpleNote(e.target.value)}
                  className="min-h-12"
                />
              </div>
              <button
                type="button"
                className="text-sm text-primary font-medium hover:text-primary-variant transition-colors cursor-pointer"
                onClick={() => setIsItemized(true)}
              >
                Break down into items
              </button>
            </div>
          )}

          {/* Phase 3: Itemized mode */}
          {selectedCategory && isItemized && (
            <div className="space-y-4 field-slide-down">
              <FormProgress steps={progressSteps} />

              {isGroceryExpense && (
                <StoreSelector
                  stores={stores}
                  selectedStore={selectedStore}
                  onSelect={setSelectedStore}
                  onClear={() => setSelectedStore(null)}
                  onSearch={setStoreSearch}
                  onCreateNew={(name) => { setNewStoreName(name); setShowStoreDialog(true); }}
                  isLoading={storesLoading}
                  onLoadMore={() => fetchNextStorePage()}
                  hasMore={hasNextStorePage}
                  isLoadingMore={isFetchingNextStorePage}
                />
              )}

              {(!isGroceryExpense || selectedStore) && (
                <ExpenseItemsForm
                  items={expenseItems.items}
                  currentItem={expenseItems.currentItem}
                  itemCategories={itemCategories}
                  editingIndex={expenseItems.editingIndex}
                  itemErrors={expenseItems.itemErrors}
                  storeId={selectedStore?.id}
                  onCurrentItemChange={expenseItems.setCurrentItem}
                  onAddItem={expenseItems.handleAddItem}
                  onEditItem={expenseItems.handleEditItem}
                  onCancelEdit={expenseItems.cancelEdit}
                  onRemoveItem={expenseItems.handleRemoveItem}
                  onInsertItem={expenseItems.handleInsertItem}
                  onQuickAddItem={expenseItems.handleQuickAddItem}
                  onQuantityChange={expenseItems.handleUpdateQuantity}
                  onCreateNewItemCategory={(name) => { setNewItemCategoryName(name); setShowItemCategoryDialog(true); }}
                  isLoadingCategories={categoriesLoading}
                />
              )}

              <button
                type="button"
                className="text-sm text-primary font-medium hover:text-primary-variant transition-colors cursor-pointer"
                onClick={() => setIsItemized(false)}
              >
                Switch to simple mode
              </button>
            </div>
          )}

          {/* Date & Time + Submit */}
          {selectedCategory && (
            <div className="space-y-5 field-slide-down">
              <DateTimePicker value={recordedAt} onChange={setRecordedAt} />

              <div className="submit-sticky">
                <Button
                  variant="expense"
                  className="w-full h-12 text-base font-semibold"
                  onClick={() => submitMutation.mutate()}
                  loading={submitMutation.isPending}
                  disabled={!canSubmit()}
                >
                  Create Expense
                </Button>
                {!canSubmit() && (
                  <p className="text-xs text-text-secondary text-center mt-2">{validationMessage()}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <AddCategoryDialog
        open={showCategoryDialog}
        onOpenChange={setShowCategoryDialog}
        initialName={newCategoryName}
        onSubmit={async (name, isConnectedToStore) => {
          const cat = await createCategory.mutateAsync({ name, isConnectedToStore });
          setSelectedCategory(cat);
          setShowCategoryDialog(false);
        }}
        isLoading={createCategory.isPending}
      />

      <AddStoreDialog
        open={showStoreDialog}
        onOpenChange={setShowStoreDialog}
        initialName={newStoreName}
        onSubmit={async (name, location) => {
          const store = await createStore.mutateAsync({ name, location });
          setSelectedStore(store);
          setShowStoreDialog(false);
        }}
        isLoading={createStore.isPending}
      />

      <AddItemCategoryDialog
        open={showItemCategoryDialog}
        onOpenChange={setShowItemCategoryDialog}
        initialName={newItemCategoryName}
        onSubmit={async (name) => {
          const cat = await createItemCategory.mutateAsync({ name });
          expenseItems.setCurrentItem({ ...expenseItems.currentItem, categoryId: cat.id });
          setShowItemCategoryDialog(false);
        }}
        isLoading={createItemCategory.isPending}
      />
    </div>
  );
}
