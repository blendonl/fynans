"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Sparkles, MapPin } from "lucide-react";
import { calculateExpenseItemsTotal } from "@/utils/calculations";
import type { Category, Store, ExpenseItem } from "@/types";
import { useCategories } from "@/hooks/use-categories";
import { useStores } from "@/hooks/use-stores";
import { useExpenseItems } from "@/hooks/use-expense-items";
import { useAiCategorySuggestion } from "@/hooks/use-ai-category-suggestion";
import { useAutoAcceptSuggestion } from "@/hooks/use-auto-accept-suggestion";
import { useReceiptFormMapping } from "@/hooks/use-receipt-form-mapping";
import { useExpenseSubmission } from "@/hooks/use-expense-submission";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StoreSelector } from "@/components/add-expense/store-selector";
import { ExpenseItemsForm } from "@/components/add-expense/expense-items-form";
import { FormProgress } from "@/components/add-expense/form-progress";
import { AddStoreDialog } from "@/components/add-expense/add-store-dialog";
import { AddItemCategoryDialog } from "@/components/add-expense/add-item-category-dialog";
import { AmountHero } from "./amount-hero";
import { DateTimePicker } from "./date-time-picker";
import { ReceiptScanArea } from "./receipt-scan-area";
import { cn } from "@/lib/utils";

function localNow() {
  return format(new Date(), "yyyy-MM-dd'T'HH:mm");
}

interface ExpenseFormProps {
  onSuccess: () => void;
  scope: "PERSONAL" | "FAMILY";
  familyId: string;
}

export function ExpenseForm({ onSuccess, scope, familyId }: ExpenseFormProps) {
  const {
    categories,
    itemCategories,
    isLoading: categoriesLoading,
    createItemCategory,
  } = useCategories("");
  const [storeSearch, setStoreSearch] = useState("");
  const {
    stores,
    isLoading: storesLoading,
    fetchNextPage: fetchNextStorePage,
    hasNextPage: hasNextStorePage,
    isFetchingNextPage: isFetchingNextStorePage,
    createStore,
  } = useStores(storeSearch);
  const queryClient = useQueryClient();
  const expenseItems = useExpenseItems();

  const ai = useAiCategorySuggestion();

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isItemized, setIsItemized] = useState(false);
  const [simpleAmount, setSimpleAmount] = useState("");
  const [simpleNote, setSimpleNote] = useState("");
  const [recordedAt, setRecordedAt] = useState(localNow);
  const [hasScannedReceipt, setHasScannedReceipt] = useState(false);

  const [showStoreDialog, setShowStoreDialog] = useState(false);
  const [newStoreName, setNewStoreName] = useState("");
  const [showItemCategoryDialog, setShowItemCategoryDialog] = useState(false);
  const [newItemCategoryName, setNewItemCategoryName] = useState("");

  const itemsTotal = calculateExpenseItemsTotal(expenseItems.items);

  // Find the "General" fallback category
  const generalCategory = useMemo(
    () => categories.find((c) => c.name.toLowerCase() === "general") ?? null,
    [categories],
  );

  // --- Simple mode: AI category from note ---
  const prevNoteRef = useRef<string>("");
  useEffect(() => {
    if (isItemized) return;
    const note = simpleNote.trim();
    if (note !== prevNoteRef.current) {
      prevNoteRef.current = note;
      if (note.length > 0) {
        ai.setExpenseNote(note);
      } else {
        ai.dismissSimpleExpenseSuggestion();
      }
    }
  }, [simpleNote, isItemized, ai]);

  // Auto-accept simple expense AI suggestion
  const handleSimpleAutoAccept = useCallback(
    (cat: { id: string; name: string }) => setSelectedCategory(cat as Category),
    [],
  );
  useAutoAcceptSuggestion(ai.simpleExpenseSuggestion, selectedCategory, categories, handleSimpleAutoAccept);

  // Default to "General" category when no AI suggestion available
  useEffect(() => {
    if (isItemized) return;
    if (simpleNote.trim().length === 0 && !selectedCategory && generalCategory) {
      setSelectedCategory(generalCategory);
    }
  }, [isItemized, simpleNote, selectedCategory, generalCategory]);

  // Default to "General" category in itemized mode when no AI suggestion
  useEffect(() => {
    if (!isItemized) return;
    if (!selectedCategory && generalCategory && !ai.isExpenseLoading) {
      setSelectedCategory(generalCategory);
    }
  }, [isItemized, selectedCategory, generalCategory, ai.isExpenseLoading]);

  // --- Itemized mode: AI expense category from item names ---
  const prevItemNamesRef = useRef<string>("");
  useEffect(() => {
    if (!isItemized) return;
    const names = expenseItems.items.map((i: ExpenseItem) => i.name);
    const key = names.join("|");
    if (key !== prevItemNamesRef.current && names.length > 0) {
      prevItemNamesRef.current = key;
      ai.setExpenseItemNames(names);
    }
  }, [expenseItems.items, isItemized, ai]);

  // Auto-accept AI expense suggestion (itemized mode)
  const handleItemizedAutoAccept = useCallback(
    (cat: { id: string; name: string }) => setSelectedCategory(cat as Category),
    [],
  );
  useAutoAcceptSuggestion(ai.expenseSuggestion, selectedCategory, categories, handleItemizedAutoAccept);

  const { handleReceiptResult } = useReceiptFormMapping({
    selectedCategory,
    setSelectedCategory,
    setSelectedStore,
    setRecordedAt,
    setIsItemized,
    setHasScannedReceipt,
    setItems: expenseItems.setItems,
    queryClient,
  });

  const { submitMutation, canSubmit, validationMessage } = useExpenseSubmission({
    isItemized,
    items: expenseItems.items,
    itemsTotal,
    selectedCategory,
    selectedStore,
    simpleAmount,
    simpleNote,
    recordedAt,
    scope,
    familyId,
    onSuccess,
  });

  const hasItems = isItemized && expenseItems.items.length > 0;
  const hasAmount = !isItemized && simpleAmount !== "" && parseFloat(simpleAmount) > 0;
  const storeSelected = selectedStore !== null;

  const progressSteps = isItemized
    ? [
        { label: "Store", completed: storeSelected, active: !storeSelected },
        { label: "Items", completed: hasItems, active: storeSelected && !hasItems },
        { label: "Review", completed: false, active: canSubmit() },
      ]
    : [
        { label: "Amount", completed: hasAmount, active: !hasAmount },
        { label: "Review", completed: false, active: canSubmit() },
      ];

  // The active AI suggestion for display
  const activeSuggestion = isItemized ? ai.expenseSuggestion : ai.simpleExpenseSuggestion;
  const isSuggestionLoading = isItemized ? ai.isExpenseLoading : ai.isSimpleExpenseLoading;

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
              autoFocus
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
          <FormProgress steps={progressSteps} />

          {/* Simple mode: Note + toggle */}
          {!isItemized && (
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

          {/* Itemized mode: Store → Items */}
          {isItemized && (
            <div className="space-y-4 field-slide-down">
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

              {storeSelected ? (
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
                  onItemNameChange={ai.setCurrentItemName}
                  itemCategoryAiSuggestion={ai.itemSuggestion}
                  isItemCategoryAiLoading={ai.isItemLoading}
                  onAcceptItemCategoryAi={ai.dismissItemSuggestion}
                  onDismissItemCategoryAi={ai.dismissItemSuggestion}
                />
              ) : (
                <div className="flex flex-col items-center gap-3 py-8 px-4 rounded-2xl border-2 border-dashed border-border text-center">
                  <MapPin className="h-8 w-8 text-text-disabled" />
                  <div>
                    <p className="text-sm font-medium text-text-secondary">Select a store first</p>
                    <p className="text-xs text-text-disabled mt-1">Items will load from your store catalog</p>
                  </div>
                </div>
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

          {/* Review section: Auto-category indicator + DateTime + Submit */}
          <div className="space-y-5 border-t border-border pt-5">
            {/* Auto-category indicator */}
            {selectedCategory && (
              <div
                className={cn(
                  "flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm field-slide-down",
                  "bg-surface-variant border border-border-light",
                )}
              >
                <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="text-text-secondary">Category:</span>
                <span className="font-semibold text-text">{selectedCategory.name}</span>
                {(activeSuggestion || isSuggestionLoading) && (
                  <span className="ml-auto text-xs text-text-disabled">auto</span>
                )}
              </div>
            )}
            {!selectedCategory && isSuggestionLoading && (
              <div
                className={cn(
                  "flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm field-slide-down",
                  "bg-primary/5 border border-primary/15",
                )}
              >
                <Sparkles className="h-3.5 w-3.5 text-primary shrink-0 animate-pulse" />
                <span className="text-text-secondary">Detecting category...</span>
                <div className="ml-auto h-3 w-16 rounded bg-primary/15 animate-pulse" />
              </div>
            )}

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
        </div>
      </div>

      {/* Dialogs */}
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
