"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { format } from "date-fns";
import {
  Clock,
  XCircle,
  Save,
  Pencil,
  User,
  ShoppingBasket,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCategories } from "@/hooks/use-categories";
import { useStores } from "@/hooks/use-stores";
import { usePaymentMethods } from "@/hooks/use-payment-methods";
import { useExpenseItems } from "@/hooks/use-expense-items";
import { useCreateDialog } from "@/hooks/use-create-dialog";
import type { Category, Store as StoreType, ExpenseItem } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/glass/glass-card";
import { ExpenseItemsForm } from "@/components/add-expense/expense-items-form";
import { AddStoreDialog } from "@/components/add-expense/add-store-dialog";
import { AddCategoryDialog } from "@/components/add-expense/add-category-dialog";
import { AddItemCategoryDialog } from "@/components/add-expense/add-item-category-dialog";
import { AmountHero } from "@/components/add-transaction/amount-hero";
import { TransactionDetailsCard } from "./transaction-details-card";
import { ReceiptGallery } from "./receipt-gallery";

/** Runtime expense shape including fields not yet in the OpenAPI spec */
export interface PendingExpenseData {
  id: string;
  categoryId: string;
  storeId: string | null;
  status: string;
  rejectionReason?: string;
  transaction: {
    id: string;
    userId: string;
    value: number;
    scope: string;
    recordedAt: string;
    paymentMethodId?: string;
    description?: string;
    familyId?: string | null;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      image?: string | null;
    };
  };
  category: { id: string; name: string; isConnectedToStore?: boolean };
  store: { id: string; name: string; location?: string } | null;
  items: {
    id: string;
    name: string;
    price: number;
    discount: number;
    quantity: number;
    categoryId: string;
    itemId?: string;
  }[];
  receiptImages: string[];
}

/** Data needed by the page to sync item changes with the API */
export interface ItemsSync {
  originalIds: string[];
  items: ExpenseItem[];
  storeId: string | null;
  expenseId: string;
}

/** Actions exposed to the parent page for header bar buttons */
export interface PendingTransactionActions {
  hasChanges: boolean;
  handleApprove: () => void;
  handleResubmit: () => void;
}

interface PendingTransactionDetailProps {
  expense: PendingExpenseData;
  onApprove: (
    changes?: Record<string, unknown>,
    itemsSync?: ItemsSync,
  ) => void;
  onResubmit: (
    changes?: Record<string, unknown>,
    itemsSync?: ItemsSync,
  ) => void;
  onUpdate: (changes: Record<string, unknown>, itemsSync?: ItemsSync) => void;
  onActionsReady?: (actions: PendingTransactionActions) => void;
  isApproving: boolean;
  isRejecting: boolean;
  isResubmitting: boolean;
  isUpdating: boolean;
}

export function PendingTransactionDetail({
  expense,
  onApprove,
  onResubmit,
  onUpdate,
  onActionsReady,
  isApproving,
  isRejecting,
  isResubmitting,
  isUpdating,
}: PendingTransactionDetailProps) {
  const { user } = useAuth();

  // ── Data hooks for selectors ──────────────────────────────────────────
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

  const { paymentMethods, isLoading: paymentMethodsLoading } =
    usePaymentMethods();

  const storeDialog = useCreateDialog();
  const categoryDialog = useCreateDialog();
  const itemCategoryDialog = useCreateDialog();
  const [, setCategorySearch] = useState("");

  // ── Edit state (initialized from expense) ─────────────────────────────
  const initialRecordedAt = useMemo(
    () =>
      format(
        new Date(expense.transaction.recordedAt),
        "yyyy-MM-dd'T'HH:mm",
      ),
    [expense.transaction.recordedAt],
  );

  const [amount, setAmount] = useState(String(expense.transaction.value));
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    expense.category as Category,
  );
  const [selectedStore, setSelectedStore] = useState<StoreType | null>(
    expense.store as StoreType | null,
  );
  const [note, setNote] = useState(expense.transaction.description || "");
  const [recordedAt, setRecordedAt] = useState(initialRecordedAt);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<
    string | null
  >(expense.transaction.paymentMethodId || null);

  // ── Items editing ─────────────────────────────────────────────────────
  const expenseItems = useExpenseItems();
  const originalItemIdsRef = useRef(expense.items.map((i) => i.id));
  const originalItemsJsonRef = useRef(
    JSON.stringify(
      expense.items.map((i) => ({
        name: i.name,
        price: i.price,
        discount: i.discount,
        quantity: i.quantity,
        categoryId: i.categoryId,
      })),
    ),
  );

  // Initialize items from expense data on mount
  useEffect(() => {
    if (expense.items.length > 0) {
      const mapped: ExpenseItem[] = expense.items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        discount: item.discount || 0,
        quantity: item.quantity,
        categoryId: item.categoryId,
      }));
      expenseItems.setItems(mapped);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasItemChanges = useMemo(() => {
    const current = JSON.stringify(
      expenseItems.items.map((i) => ({
        name: i.name,
        price: i.price,
        discount: i.discount,
        quantity: i.quantity,
        categoryId: i.categoryId,
      })),
    );
    return current !== originalItemsJsonRef.current;
  }, [expenseItems.items]);

  // ── Derived state ─────────────────────────────────────────────────────
  const isPending = expense.status === "PENDING";
  const isRejected = expense.status === "REJECTED";
  const isCreator = user?.id === expense.transaction.userId;
  const anyLoading =
    isApproving || isRejecting || isResubmitting || isUpdating;

  // ── Change tracking (fields) ──────────────────────────────────────────
  const hasFieldChanges = useMemo(() => {
    const parsedAmount = parseFloat(amount);
    return (
      (!isNaN(parsedAmount) && parsedAmount !== expense.transaction.value) ||
      (isNaN(parsedAmount) && amount !== String(expense.transaction.value)) ||
      selectedCategory?.id !== expense.categoryId ||
      (selectedStore?.id ?? null) !== (expense.storeId ?? null) ||
      note !== (expense.transaction.description || "") ||
      recordedAt !== initialRecordedAt ||
      (selectedPaymentMethodId ?? null) !==
        (expense.transaction.paymentMethodId ?? null)
    );
  }, [
    amount,
    expense.transaction.value,
    selectedCategory?.id,
    expense.categoryId,
    selectedStore?.id,
    expense.storeId,
    note,
    expense.transaction.description,
    recordedAt,
    initialRecordedAt,
    selectedPaymentMethodId,
    expense.transaction.paymentMethodId,
  ]);

  const hasChanges = hasFieldChanges || hasItemChanges;

  const buildChanges = useCallback(() => {
    const changes: Record<string, unknown> = {};
    const parsedAmount = parseFloat(amount);
    if (!isNaN(parsedAmount) && parsedAmount !== expense.transaction.value) {
      changes.amount = parsedAmount;
    }
    if (selectedCategory?.id !== expense.categoryId) {
      changes.categoryId = selectedCategory?.id;
    }
    if ((selectedStore?.id ?? null) !== (expense.storeId ?? null)) {
      changes.storeId = selectedStore?.id || null;
    }
    if (note !== (expense.transaction.description || "")) {
      changes.note = note;
    }
    if (recordedAt !== initialRecordedAt) {
      changes.recordedAt = recordedAt;
    }
    if (
      (selectedPaymentMethodId ?? null) !==
      (expense.transaction.paymentMethodId ?? null)
    ) {
      changes.paymentMethodId = selectedPaymentMethodId || null;
    }
    return changes;
  }, [
    amount,
    expense.transaction.value,
    selectedCategory?.id,
    expense.categoryId,
    selectedStore?.id,
    expense.storeId,
    note,
    expense.transaction.description,
    recordedAt,
    initialRecordedAt,
    selectedPaymentMethodId,
    expense.transaction.paymentMethodId,
  ]);

  const buildItemsSync = useCallback(
    (): ItemsSync => ({
      originalIds: originalItemIdsRef.current,
      items: expenseItems.items,
      storeId: selectedStore?.id || expense.storeId || null,
      expenseId: expense.id,
    }),
    [expenseItems.items, selectedStore?.id, expense.storeId, expense.id],
  );

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleSave = () => {
    if (hasChanges) {
      const sync = hasItemChanges ? buildItemsSync() : undefined;
      onUpdate(buildChanges(), sync);
    }
  };

  const handleApprove = useCallback(() => {
    const sync = hasItemChanges ? buildItemsSync() : undefined;
    onApprove(hasFieldChanges ? buildChanges() : undefined, sync);
  }, [hasItemChanges, hasFieldChanges, buildItemsSync, buildChanges, onApprove]);

  const handleResubmit = useCallback(() => {
    const sync = hasItemChanges ? buildItemsSync() : undefined;
    onResubmit(hasFieldChanges ? buildChanges() : undefined, sync);
  }, [hasItemChanges, hasFieldChanges, buildItemsSync, buildChanges, onResubmit]);

  // Expose actions to parent page for header bar buttons
  useEffect(() => {
    onActionsReady?.({ hasChanges, handleApprove, handleResubmit });
  }, [hasChanges, onActionsReady, handleApprove, handleResubmit]);

  return (
    <div className="space-y-5">
      {/* ── Status + Amount hero ─────────────────────────────────────── */}
      <GlassCard variant="strong" className="p-6 sm:p-8">
        <div className="flex justify-center mb-2">
          {isPending && (
            <Badge className="bg-warning/15 text-warning border-warning/20 gap-1">
              <Clock className="h-3 w-3" />
              Pending Review
            </Badge>
          )}
          {isRejected && (
            <Badge variant="destructive" className="gap-1">
              <XCircle className="h-3 w-3" />
              Rejected
            </Badge>
          )}
        </div>

        <AmountHero value={amount} onChange={setAmount} type="expense" />

        {/* Submitted by line */}
        <div className="flex items-center justify-center gap-2 mt-3 text-xs text-text-secondary">
          <User className="h-3 w-3" />
          <span>
            {isCreator
              ? "Submitted by you"
              : `${expense.transaction.user.firstName} ${expense.transaction.user.lastName}`}
          </span>
          <span className="text-text-disabled">·</span>
          <span>{format(new Date(expense.transaction.recordedAt), "MMM d, yyyy")}</span>
        </div>
      </GlassCard>

      {/* ── Rejection reason ─────────────────────────────────────────── */}
      {isRejected && expense.rejectionReason && (
        <GlassCard className="p-5 sm:p-6 border-expense/20">
          <h3 className="text-[11px] font-medium text-expense uppercase tracking-wider mb-2">
            Rejection Reason
          </h3>
          <p className="text-sm text-text">{expense.rejectionReason}</p>
        </GlassCard>
      )}

      {/* ── Unsaved changes indicator ────────────────────────────────── */}
      {hasChanges && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-primary/8 border border-primary/15 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-xs font-medium text-primary">
            <Pencil className="h-3 w-3" />
            Unsaved changes
          </div>
          <Button
            variant="ghost"
            className="h-8 px-3 text-xs font-medium text-primary hover:bg-primary/10"
            onClick={handleSave}
            loading={isUpdating}
            disabled={anyLoading && !isUpdating}
          >
            <Save className="h-3 w-3 mr-1.5" />
            Save
          </Button>
        </div>
      )}

      <div className="lg:grid lg:grid-cols-12 lg:gap-6 space-y-5 lg:space-y-0">
        {/* Left column — Details + Receipts (40%) */}
        <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-6 lg:self-start">
          <TransactionDetailsCard
            data={{
              category: expense.category,
              store: expense.store,
              scope: expense.transaction.scope,
            }}
            type="expense"
            editable={{
              categories,
              selectedCategory,
              onCategorySelect: setSelectedCategory,
              onCategoryClear: () => setSelectedCategory(null),
              onCategorySearch: setCategorySearch,
              onCategoryCreateNew: (name) => categoryDialog.show(name),
              categoriesLoading,
              stores,
              selectedStore,
              onStoreSelect: setSelectedStore,
              onStoreClear: () => setSelectedStore(null),
              onStoreSearch: setStoreSearch,
              onStoreCreateNew: (name) => storeDialog.show(name),
              storesLoading,
              storePagination: {
                onLoadMore: () => fetchNextStorePage(),
                hasMore: hasNextStorePage,
                isLoadingMore: isFetchingNextStorePage,
              },
              note,
              onNoteChange: setNote,
              paymentMethods,
              selectedPaymentMethodId,
              onPaymentMethodSelect: setSelectedPaymentMethodId,
              paymentMethodsLoading,
              recordedAt,
              onRecordedAtChange: setRecordedAt,
            }}
          />

          <ReceiptGallery images={expense.receiptImages || []} />
        </div>

        {/* Right column — Items (60%) */}
        <div className="lg:col-span-7 space-y-5">
          {(expenseItems.items.length > 0 || expense.items.length > 0) && (
            <GlassCard className="p-5 sm:p-6">
              <h3 className="text-[11px] font-medium text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
                <ShoppingBasket className="h-3.5 w-3.5" />
                Items
              </h3>
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
                borderless
              />
            </GlassCard>
          )}
        </div>
      </div>

      {/* ── Dialogs ──────────────────────────────────────────────────── */}
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
          const cat = await createCategory.mutateAsync({
            name,
            isConnectedToStore,
          });
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
          expenseItems.setCurrentItem({
            ...expenseItems.currentItem,
            categoryId: cat.id,
          });
          itemCategoryDialog.close();
        }}
        isLoading={createItemCategory.isPending}
      />
    </div>
  );
}
