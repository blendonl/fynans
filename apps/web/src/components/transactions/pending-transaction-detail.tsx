"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { format } from "date-fns";
import {
  Check,
  X,
  RotateCcw,
  Trash2,
  Clock,
  XCircle,
  Save,
  Pencil,
} from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { useAuth } from "@/hooks/use-auth";
import { useCategories } from "@/hooks/use-categories";
import { useStores } from "@/hooks/use-stores";
import { usePaymentMethods } from "@/hooks/use-payment-methods";
import { useExpenseItems } from "@/hooks/use-expense-items";
import { useCreateDialog } from "@/hooks/use-create-dialog";
import type { Category, Store, ExpenseItem } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/glass/glass-card";
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
import { CategorySelector } from "@/components/add-expense/category-selector";
import { StoreSelector } from "@/components/add-expense/store-selector";
import { ExpenseItemsForm } from "@/components/add-expense/expense-items-form";
import { AddStoreDialog } from "@/components/add-expense/add-store-dialog";
import { AddCategoryDialog } from "@/components/add-expense/add-category-dialog";
import { AddItemCategoryDialog } from "@/components/add-expense/add-item-category-dialog";
import { PaymentMethodSelector } from "@/components/add-transaction/payment-method-selector";
import { DateTimePicker } from "@/components/add-transaction/date-time-picker";
import { AmountHero } from "@/components/add-transaction/amount-hero";
import { RejectDialog } from "./reject-dialog";
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

interface PendingTransactionDetailProps {
  expense: PendingExpenseData;
  onApprove: (
    changes?: Record<string, unknown>,
    itemsSync?: ItemsSync,
  ) => void;
  onReject: (reason: string) => void;
  onResubmit: (
    changes?: Record<string, unknown>,
    itemsSync?: ItemsSync,
  ) => void;
  onUpdate: (changes: Record<string, unknown>, itemsSync?: ItemsSync) => void;
  onDelete: () => void;
  isApproving: boolean;
  isRejecting: boolean;
  isResubmitting: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export function PendingTransactionDetail({
  expense,
  onApprove,
  onReject,
  onResubmit,
  onUpdate,
  onDelete,
  isApproving,
  isRejecting,
  isResubmitting,
  isUpdating,
  isDeleting,
}: PendingTransactionDetailProps) {
  const { user } = useAuth();
  const [showRejectDialog, setShowRejectDialog] = useState(false);

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
  const [selectedStore, setSelectedStore] = useState<Store | null>(
    expense.store as Store | null,
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
    isApproving || isRejecting || isResubmitting || isUpdating || isDeleting;

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

  const handleApprove = () => {
    const sync = hasItemChanges ? buildItemsSync() : undefined;
    onApprove(hasFieldChanges ? buildChanges() : undefined, sync);
  };

  const handleResubmit = () => {
    const sync = hasItemChanges ? buildItemsSync() : undefined;
    onResubmit(hasFieldChanges ? buildChanges() : undefined, sync);
  };

  return (
    <div className="space-y-6">
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

        {isCreator && (
          <p className="text-xs text-text-disabled text-center mt-1">
            Created by you
          </p>
        )}
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

      {/* ── Editable details ─────────────────────────────────────────── */}
      <GlassCard className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">
            Details
          </h3>
          {hasChanges && (
            <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] gap-1 animate-in fade-in duration-200">
              <Pencil className="h-2.5 w-2.5" />
              Unsaved changes
            </Badge>
          )}
        </div>

        <div className="space-y-5">
          <CategorySelector
            categories={categories}
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
            onClear={() => setSelectedCategory(null)}
            onSearch={setCategorySearch}
            onCreateNew={(name) => categoryDialog.show(name)}
            isLoading={categoriesLoading}
          />

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

          <div className="space-y-2">
            <Label>Note</Label>
            <Input
              placeholder="Add a note (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-12"
            />
          </div>

          {/* Read-only fields: Scope & Creator */}
          <div className="border-t border-border-light/50 pt-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <p className="text-[11px] text-text-disabled uppercase tracking-wide">
                  Scope
                </p>
                <p className="text-sm font-medium text-text mt-0.5">
                  {expense.transaction.scope}
                </p>
              </div>
              {expense.transaction.user && (
                <div>
                  <p className="text-[11px] text-text-disabled uppercase tracking-wide">
                    By
                  </p>
                  <p className="text-sm font-medium text-text mt-0.5">
                    {expense.transaction.user.firstName}{" "}
                    {expense.transaction.user.lastName}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Payment method & Date */}
          <div className="border-t border-border-light/50 pt-4 space-y-5">
            <PaymentMethodSelector
              paymentMethods={paymentMethods}
              selectedId={selectedPaymentMethodId}
              onSelect={setSelectedPaymentMethodId}
              isLoading={paymentMethodsLoading}
            />

            <DateTimePicker value={recordedAt} onChange={setRecordedAt} />
          </div>
        </div>
      </GlassCard>

      {/* ── Items (editable) ─────────────────────────────────────────── */}
      {(expenseItems.items.length > 0 || expense.items.length > 0) && (
        <GlassCard className="p-5 sm:p-6">
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
          />
        </GlassCard>
      )}

      <ReceiptGallery images={expense.receiptImages || []} />

      {/* ── Actions ──────────────────────────────────────────────────── */}
      <div className="space-y-3">
        {hasChanges && (
          <Button
            className="w-full h-12 gap-2"
            variant="outline"
            onClick={handleSave}
            loading={isUpdating}
            disabled={anyLoading && !isUpdating}
          >
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        )}

        {isPending && (
          <div className="flex gap-3">
            <Button
              className="flex-1 h-12 gap-2 bg-income hover:bg-income/90 text-white"
              onClick={handleApprove}
              loading={isApproving}
              disabled={anyLoading && !isApproving}
            >
              <Check className="h-4 w-4" />
              {hasChanges ? "Save & Approve" : "Approve"}
            </Button>
            <Button
              variant="destructive"
              className="flex-1 h-12 gap-2"
              onClick={() => setShowRejectDialog(true)}
              disabled={anyLoading}
            >
              <X className="h-4 w-4" />
              Reject
            </Button>
          </div>
        )}

        {isRejected && (
          <Button
            className="w-full h-12 gap-2"
            onClick={handleResubmit}
            loading={isResubmitting}
            disabled={anyLoading && !isResubmitting}
          >
            <RotateCcw className="h-4 w-4" />
            {hasChanges ? "Save & Re-submit" : "Re-submit for Review"}
          </Button>
        )}

        <div className="flex justify-center pt-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-expense hover:text-expense-light transition-colors">
                <Trash2 className="h-4 w-4" />
                Delete Transaction
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this transaction?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  this transaction.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} disabled={isDeleting}>
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* ── Dialogs ──────────────────────────────────────────────────── */}
      <RejectDialog
        open={showRejectDialog}
        onOpenChange={setShowRejectDialog}
        onConfirm={(reason) => {
          onReject(reason);
          setShowRejectDialog(false);
        }}
        isLoading={isRejecting}
      />

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
