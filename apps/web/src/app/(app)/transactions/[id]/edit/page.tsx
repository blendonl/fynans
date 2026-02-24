"use client";

import { use, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import {
  expenseControllerFindOne,
  expenseControllerUpdate,
} from "@/api/generated/endpoints/expense/expense";
import {
  incomeControllerFindOne,
  incomeControllerUpdate,
} from "@/api/generated/endpoints/income/income";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/glass/glass-card";
import { AmountHero } from "@/components/add-transaction/amount-hero";
import { TransactionDetailsCard } from "@/components/transactions/transaction-details-card";
import { AddStoreDialog } from "@/components/add-expense/add-store-dialog";
import { AddCategoryDialog } from "@/components/add-expense/add-category-dialog";
import { useCategories } from "@/hooks/use-categories";
import { useStores } from "@/hooks/use-stores";
import { usePaymentMethods } from "@/hooks/use-payment-methods";
import { useCreateDialog } from "@/hooks/use-create-dialog";
import type { Category, Store as StoreType } from "@/types";

interface TransactionData {
  id: string;
  type: "expense" | "income";
  categoryId: string;
  category: { id: string; name: string };
  store?: { id: string; name: string; location?: string } | null;
  storeId?: string | null;
  transaction: {
    id: string;
    value: number;
    recordedAt?: string;
    description?: string;
    paymentMethodId?: string;
  };
}

export default function EditTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const type = (searchParams.get("type") || "expense") as "expense" | "income";
  const isExpense = type === "expense";

  // ── Fetch transaction data ────────────────────────────────────────────
  const { data: txData, isLoading } = useQuery({
    queryKey: ["transaction", id, type, "edit"],
    queryFn: async () => {
      const res = isExpense
        ? await expenseControllerFindOne(id)
        : await incomeControllerFindOne(id);
      const data = res.data as unknown as Record<string, unknown>;
      const tx = data.transaction as Record<string, unknown> | undefined;
      return {
        id: data.id as string,
        type,
        categoryId: (data as any).categoryId as string,
        category: data.category as { id: string; name: string },
        store: data.store as TransactionData["store"],
        storeId: (data as any).storeId as string | null | undefined,
        transaction: {
          id: (tx?.id as string) || "",
          value: (tx?.value as number) || 0,
          recordedAt: tx?.recordedAt as string | undefined,
          description: tx?.description as string | undefined,
          paymentMethodId: tx?.paymentMethodId as string | undefined,
        },
      } satisfies TransactionData;
    },
  });

  // ── Data hooks ────────────────────────────────────────────────────────
  const [categorySearch, setCategorySearch] = useState("");
  const {
    categories: expenseCategories,
    incomeCategories,
    isLoading: categoriesLoading,
    createCategory,
    fetchNextCategoryPage,
    hasNextCategoryPage,
    isFetchingNextCategoryPage,
  } = useCategories(categorySearch);

  const categories = isExpense ? expenseCategories : incomeCategories;

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

  // ── Edit state (initialized once data loads) ──────────────────────────
  const [amount, setAmount] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [selectedStore, setSelectedStore] = useState<StoreType | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [recordedAt, setRecordedAt] = useState<string | null>(null);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<
    string | null | undefined
  >(undefined);

  // Initialize form state from fetched data (only once)
  const [initialized, setInitialized] = useState(false);
  if (txData && !initialized) {
    setAmount(String(txData.transaction.value));
    setSelectedCategory(txData.category as Category);
    setSelectedStore((txData.store as StoreType) || null);
    setNote(txData.transaction.description || "");
    setRecordedAt(
      txData.transaction.recordedAt
        ? format(
            new Date(txData.transaction.recordedAt),
            "yyyy-MM-dd'T'HH:mm",
          )
        : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    );
    setSelectedPaymentMethodId(
      txData.transaction.paymentMethodId || null,
    );
    setInitialized(true);
  }

  // ── Change tracking ───────────────────────────────────────────────────
  const initialRecordedAt = useMemo(() => {
    if (!txData?.transaction.recordedAt) return "";
    return format(
      new Date(txData.transaction.recordedAt),
      "yyyy-MM-dd'T'HH:mm",
    );
  }, [txData?.transaction.recordedAt]);

  const hasChanges = useMemo(() => {
    if (!txData || !initialized) return false;
    const parsedAmount = parseFloat(amount || "0");
    return (
      (!isNaN(parsedAmount) && parsedAmount !== txData.transaction.value) ||
      selectedCategory?.id !== txData.categoryId ||
      (isExpense &&
        (selectedStore?.id ?? null) !== (txData.storeId ?? null)) ||
      (note || "") !== (txData.transaction.description || "") ||
      recordedAt !== initialRecordedAt ||
      (selectedPaymentMethodId ?? null) !==
        (txData.transaction.paymentMethodId ?? null)
    );
  }, [
    txData,
    initialized,
    amount,
    selectedCategory?.id,
    selectedStore?.id,
    note,
    recordedAt,
    initialRecordedAt,
    selectedPaymentMethodId,
    isExpense,
  ]);

  // ── Save mutation ─────────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!txData) return;
      if (isExpense) {
        const body: Record<string, unknown> = {};
        const parsedAmount = parseFloat(amount || "0");
        if (!isNaN(parsedAmount) && parsedAmount !== txData.transaction.value) {
          body.amount = parsedAmount;
        }
        if (selectedCategory?.id !== txData.categoryId) {
          body.categoryId = selectedCategory?.id;
        }
        if ((selectedStore?.id ?? null) !== (txData.storeId ?? null)) {
          body.storeId = selectedStore?.id || null;
        }
        if ((note || "") !== (txData.transaction.description || "")) {
          body.note = note || "";
        }
        if (recordedAt !== initialRecordedAt) {
          body.recordedAt = recordedAt;
        }
        if (
          (selectedPaymentMethodId ?? null) !==
          (txData.transaction.paymentMethodId ?? null)
        ) {
          body.paymentMethodId = selectedPaymentMethodId || null;
        }
        await expenseControllerUpdate(id, body as any);
      } else {
        const body: Record<string, unknown> = {};
        const parsedAmount = parseFloat(amount || "0");
        if (!isNaN(parsedAmount) && parsedAmount !== txData.transaction.value) {
          body.amount = parsedAmount;
        }
        if (selectedCategory?.id !== txData.categoryId) {
          body.categoryId = selectedCategory?.id;
        }
        if (recordedAt !== initialRecordedAt) {
          body.recordedAt = recordedAt;
        }
        if (
          (selectedPaymentMethodId ?? null) !==
          (txData.transaction.paymentMethodId ?? null)
        ) {
          body.paymentMethodId = selectedPaymentMethodId || null;
        }
        await incomeControllerUpdate(id, body as any);
      }
    },
    onSuccess: () => {
      toast.success("Transaction updated");
      queryClient.invalidateQueries({ queryKey: ["transaction", id] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      router.push(`/transactions/${id}?type=${type}`);
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to update transaction",
      );
    },
  });

  // ── Loading / Not found states ────────────────────────────────────────
  if (isLoading || !initialized) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 rounded-md bg-surface-variant skeleton-shimmer" />
        <div className="h-40 rounded-2xl bg-surface-variant/30 skeleton-shimmer" />
        <div className="h-64 rounded-2xl bg-surface-variant/30 skeleton-shimmer" />
      </div>
    );
  }

  if (!txData) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Transaction not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 dash-animate-in">
      {/* ── Header bar ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-text-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline ml-2">Back to Transaction</span>
        </Button>
        <Button
          onClick={() => saveMutation.mutate()}
          loading={saveMutation.isPending}
          disabled={!hasChanges || saveMutation.isPending}
        >
          <Save className="h-4 w-4" />
          <span className="hidden sm:inline ml-2">Save</span>
        </Button>
      </div>

      {/* ── Amount hero ──────────────────────────────────────────────── */}
      <GlassCard variant="strong" className="p-6 sm:p-8">
        <AmountHero
          value={amount || "0"}
          onChange={setAmount}
          type={type}
        />
      </GlassCard>

      {/* ── Editable fields ──────────────────────────────────────────── */}
      <TransactionDetailsCard
        data={{
          category: txData.category,
          store: txData.store,
        }}
        type={type}
        editable={{
          categories,
          selectedCategory,
          onCategorySelect: setSelectedCategory,
          onCategoryClear: () => setSelectedCategory(null),
          onCategorySearch: setCategorySearch,
          onCategoryCreateNew: (name) => categoryDialog.show(name),
          categoriesLoading,
          categoryPagination: isExpense
            ? {
                onLoadMore: () => fetchNextCategoryPage(),
                hasMore: hasNextCategoryPage,
                isLoadingMore: isFetchingNextCategoryPage,
              }
            : undefined,
          stores: isExpense ? stores : undefined,
          selectedStore: isExpense ? selectedStore : undefined,
          onStoreSelect: isExpense ? setSelectedStore : undefined,
          onStoreClear: isExpense ? () => setSelectedStore(null) : undefined,
          onStoreSearch: isExpense ? setStoreSearch : undefined,
          onStoreCreateNew: isExpense
            ? (name) => storeDialog.show(name)
            : undefined,
          storesLoading: isExpense ? storesLoading : undefined,
          storePagination: isExpense
            ? {
                onLoadMore: () => fetchNextStorePage(),
                hasMore: hasNextStorePage,
                isLoadingMore: isFetchingNextStorePage,
              }
            : undefined,
          note: note || "",
          onNoteChange: setNote,
          paymentMethods,
          selectedPaymentMethodId: selectedPaymentMethodId ?? null,
          onPaymentMethodSelect: setSelectedPaymentMethodId,
          paymentMethodsLoading,
          recordedAt: recordedAt || "",
          onRecordedAtChange: setRecordedAt,
        }}
      />

      {/* ── Dialogs ──────────────────────────────────────────────────── */}
      {isExpense && (
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
      )}

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
    </div>
  );
}
