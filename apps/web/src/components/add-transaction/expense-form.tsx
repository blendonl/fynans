"use client";

import { useState, useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import { calculateExpenseItemsTotal } from "@/utils/calculations";
import type { Category, Store } from "@/types";
import { useCategories } from "@/hooks/use-categories";
import { useStores } from "@/hooks/use-stores";
import { useExpenseItems } from "@/hooks/use-expense-items";
import { useExpenseAiSuggestions } from "@/hooks/use-expense-ai-suggestions";
import { useReceiptFormMapping } from "@/hooks/use-receipt-form-mapping";
import { useExpenseSubmission } from "@/hooks/use-expense-submission";
import { usePaymentMethods } from "@/hooks/use-payment-methods";
import { useAutoSelectPaymentMethod } from "@/hooks/use-auto-select-payment-method";
import { useCreateDialog } from "@/hooks/use-create-dialog";
import { localNow } from "@/lib/date-utils";
import { Input } from "@/components/ui/input";
import { StoreSelector } from "@/components/add-expense/store-selector";
import { CategorySelector } from "@/components/add-expense/category-selector";
import { ExpenseItemsForm } from "@/components/add-expense/expense-items-form";
import { FormProgress } from "@/components/add-expense/form-progress";
import { AddStoreDialog } from "@/components/add-expense/add-store-dialog";
import { AddCategoryDialog } from "@/components/add-expense/add-category-dialog";
import { AddItemCategoryDialog } from "@/components/add-expense/add-item-category-dialog";
import { AmountHero } from "./amount-hero";
import { DateTimePicker } from "./date-time-picker";
import { ReceiptScanArea } from "./receipt-scan-area";
import { PaymentMethodSelector } from "./payment-method-selector";
import { SubmitButtons } from "./submit-buttons";

interface ExpenseFormProps {
  onSuccess: () => void;
  onSaveForReview?: () => void;
  scope: "PERSONAL" | "FAMILY";
  familyId: string;
}

export function ExpenseForm({ onSuccess, onSaveForReview, scope, familyId }: ExpenseFormProps) {
  const {
    categories,
    itemCategories,
    isLoading: categoriesLoading,
    createCategory,
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
  const { paymentMethods, isLoading: paymentMethodsLoading } = usePaymentMethods();

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useAutoSelectPaymentMethod(paymentMethods);
  const [isItemized, setIsItemized] = useState(false);
  const [simpleAmount, setSimpleAmount] = useState("");
  const [simpleNote, setSimpleNote] = useState("");
  const [recordedAt, setRecordedAt] = useState(localNow);
  const [hasScannedReceipt, setHasScannedReceipt] = useState(false);
  const [pendingIdFromScan, setPendingIdFromScan] = useState<string | null>(null);
  const [receiptIdFromScan, setReceiptIdFromScan] = useState<string | null>(null);
  const [, setCategorySearch] = useState("");

  const storeDialog = useCreateDialog();
  const categoryDialog = useCreateDialog();
  const itemCategoryDialog = useCreateDialog();

  const itemsTotal = calculateExpenseItemsTotal(expenseItems.items);

  const { ai, activeSuggestion, isSuggestionLoading } = useExpenseAiSuggestions({
    isItemized,
    simpleNote,
    expenseItems: expenseItems.items,
    categories,
    selectedCategory,
    setSelectedCategory,
  });

  const generalCategory = useMemo(
    () => categories.find((c) => c.name.toLowerCase() === "general") ?? null,
    [categories],
  );

  useEffect(() => {
    if (isItemized) return;
    if (simpleNote.trim().length === 0 && !selectedCategory && generalCategory) {
      setSelectedCategory(generalCategory);
    }
  }, [isItemized, simpleNote, selectedCategory, generalCategory]);

  useEffect(() => {
    if (!isItemized) return;
    if (!selectedCategory && generalCategory && !ai.isExpenseLoading) {
      setSelectedCategory(generalCategory);
    }
  }, [isItemized, selectedCategory, generalCategory, ai.isExpenseLoading]);

  const { handleReceiptResult } = useReceiptFormMapping({
    selectedCategory,
    setSelectedCategory,
    setSelectedStore,
    setRecordedAt,
    setIsItemized,
    setHasScannedReceipt,
    setItems: expenseItems.setItems,
    queryClient,
    onPendingCreated: (id) => setPendingIdFromScan(id),
    onReceiptIdCaptured: (id) => setReceiptIdFromScan(id),
  });

  const receiptScanOptions = useMemo(() => ({
    autoCreatePending: true,
    familyId: scope === "FAMILY" ? familyId : undefined,
    paymentMethodId: selectedPaymentMethodId || undefined,
  }), [scope, familyId, selectedPaymentMethodId]);

  const { submitMutation, saveForReviewMutation, canSubmit: canSubmitFn, canSaveForReview: canSaveForReviewFn, getValidationMessage } = useExpenseSubmission({
    onSuccess,
    onSaveForReview,
    onCleanupPending: () => setPendingIdFromScan(null),
  });

  const formState = {
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
    paymentMethodId: selectedPaymentMethodId,
    pendingIdToCleanup: pendingIdFromScan,
    receiptIdToLink: receiptIdFromScan,
  } as const;

  const hasItems = isItemized && expenseItems.items.length > 0;
  const hasAmount = !isItemized && simpleAmount !== "" && parseFloat(simpleAmount) > 0;
  const storeSelected = selectedStore !== null;

  const progressSteps = isItemized
    ? [
        { label: "Store", completed: storeSelected, active: !storeSelected },
        { label: "Items", completed: hasItems, active: storeSelected && !hasItems },
        { label: "Review", completed: false, active: canSubmitFn(formState) },
      ]
    : [
        { label: "Amount", completed: hasAmount, active: !hasAmount },
        { label: "Review", completed: false, active: canSubmitFn(formState) },
      ];

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:gap-8">
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
            scanOptions={receiptScanOptions}
          />
        </div>

        <div className="space-y-5 mt-5 lg:mt-0 flex-1 min-w-0">
          <FormProgress steps={progressSteps} />

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

          {isItemized && (
            <div className="space-y-4 field-slide-down">
              <StoreSelector
                stores={stores}
                selectedStore={selectedStore}
                onSelect={setSelectedStore}
                onClear={() => setSelectedStore(null)}
                onSearch={setStoreSearch}
                onCreateNew={(name) => storeDialog.show(name)}
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
                  onCreateNewItemCategory={(name) => itemCategoryDialog.show(name)}
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

          <div className="space-y-5 border-t border-border pt-5">
            <CategorySelector
              categories={categories}
              selectedCategory={selectedCategory}
              onSelect={setSelectedCategory}
              onClear={() => setSelectedCategory(null)}
              onSearch={setCategorySearch}
              onCreateNew={(name) => categoryDialog.show(name)}
              isLoading={categoriesLoading}
              aiSuggestion={activeSuggestion}
              onAcceptSuggestion={isItemized ? ai.dismissExpenseSuggestion : ai.dismissSimpleExpenseSuggestion}
              onDismissSuggestion={isItemized ? ai.dismissExpenseSuggestion : ai.dismissSimpleExpenseSuggestion}
              isSuggestionLoading={isSuggestionLoading}
            />

            <PaymentMethodSelector
              paymentMethods={paymentMethods}
              selectedId={selectedPaymentMethodId}
              onSelect={setSelectedPaymentMethodId}
              isLoading={paymentMethodsLoading}
            />

            <DateTimePicker value={recordedAt} onChange={setRecordedAt} />

            <SubmitButtons
              type="expense"
              canSubmit={canSubmitFn(formState)}
              canSaveForReview={canSaveForReviewFn(formState)}
              isSubmitting={submitMutation.isPending}
              isSavingForReview={saveForReviewMutation.isPending}
              validationMessage={getValidationMessage(formState)}
              onSubmit={() => submitMutation.mutate(formState)}
              onSaveForReview={() => saveForReviewMutation.mutate(formState)}
            />
          </div>
        </div>
      </div>

      <AddStoreDialog
        open={storeDialog.open}
        onOpenChange={storeDialog.setOpen}
        initialName={storeDialog.name}
        onSubmit={async (name, location) => {
          const store = await createStore.mutateAsync({ name, location });
          setSelectedStore(store);
          storeDialog.close();
        }}
        isLoading={createStore.isPending}
      />

      <AddCategoryDialog
        open={categoryDialog.open}
        onOpenChange={categoryDialog.setOpen}
        initialName={categoryDialog.name}
        onSubmit={async (name, isConnectedToStore) => {
          const cat = await createCategory.mutateAsync({ name, isConnectedToStore });
          setSelectedCategory(cat as Category);
          categoryDialog.close();
        }}
        isLoading={createCategory.isPending}
      />

      <AddItemCategoryDialog
        open={itemCategoryDialog.open}
        onOpenChange={itemCategoryDialog.setOpen}
        initialName={itemCategoryDialog.name}
        onSubmit={async (name) => {
          const cat = await createItemCategory.mutateAsync({ name });
          expenseItems.setCurrentItem({ ...expenseItems.currentItem, categoryId: cat.id });
          itemCategoryDialog.close();
        }}
        isLoading={createItemCategory.isPending}
      />
    </div>
  );
}
