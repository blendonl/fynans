import { Tag, StickyNote } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/glass/glass-card";
import { CategorySelector } from "@/components/add-expense/category-selector";
import { StoreSelector } from "@/components/add-expense/store-selector";
import { PaymentMethodSelector } from "@/components/add-transaction/payment-method-selector";
import { DateTimePicker } from "@/components/add-transaction/date-time-picker";
import type { Category, Store as StoreType, PaymentMethod } from "@/types";

interface TransactionDetailsCardEditableProps {
  categories: Category[];
  selectedCategory: Category | null;
  onCategorySelect: (cat: Category) => void;
  onCategoryClear: () => void;
  onCategorySearch: (q: string) => void;
  onCategoryCreateNew: (name: string) => void;
  categoriesLoading: boolean;
  categoryPagination?: {
    onLoadMore: () => void;
    hasMore: boolean;
    isLoadingMore: boolean;
  };
  stores?: StoreType[];
  selectedStore?: StoreType | null;
  onStoreSelect?: (s: StoreType) => void;
  onStoreClear?: () => void;
  onStoreSearch?: (q: string) => void;
  onStoreCreateNew?: (name: string) => void;
  storesLoading?: boolean;
  storePagination?: {
    onLoadMore: () => void;
    hasMore: boolean;
    isLoadingMore: boolean;
  };
  note: string;
  onNoteChange: (v: string) => void;
  paymentMethods: PaymentMethod[];
  selectedPaymentMethodId: string | null;
  onPaymentMethodSelect: (id: string | null) => void;
  paymentMethodsLoading: boolean;
  recordedAt: string;
  onRecordedAtChange: (v: string) => void;
}

interface TransactionDetailsCardProps {
  data: {
    category: { id: string; name: string };
    store?: { id: string; name: string; location?: string } | null;
    note?: string;
    scope?: string;
    user?: { firstName: string; lastName: string } | null;
  };
  type: "expense" | "income";
  editable?: TransactionDetailsCardEditableProps;
}

export type { TransactionDetailsCardEditableProps };

export function TransactionDetailsCard({
  data,
  type,
  editable,
}: TransactionDetailsCardProps) {
  const isExpense = type === "expense";

  if (editable) {
    return (
      <GlassCard className="p-5 sm:p-6">
        <h3 className="text-[11px] font-medium text-text-secondary uppercase tracking-wider mb-5 flex items-center gap-2">
          <Tag className="h-3 w-3" />
          Transaction Details
        </h3>

        <div className="space-y-5">
          <CategorySelector
            categories={editable.categories}
            selectedCategory={editable.selectedCategory}
            onSelect={editable.onCategorySelect}
            onClear={editable.onCategoryClear}
            onSearch={editable.onCategorySearch}
            onCreateNew={editable.onCategoryCreateNew}
            isLoading={editable.categoriesLoading}
            onLoadMore={editable.categoryPagination?.onLoadMore}
            hasMore={editable.categoryPagination?.hasMore}
            isLoadingMore={editable.categoryPagination?.isLoadingMore}
          />

          {isExpense && editable.stores && editable.onStoreSelect && (
            <StoreSelector
              stores={editable.stores}
              selectedStore={editable.selectedStore ?? null}
              onSelect={editable.onStoreSelect}
              onClear={editable.onStoreClear ?? (() => {})}
              onSearch={editable.onStoreSearch ?? (() => {})}
              onCreateNew={editable.onStoreCreateNew ?? (() => {})}
              isLoading={editable.storesLoading ?? false}
              onLoadMore={editable.storePagination?.onLoadMore}
              hasMore={editable.storePagination?.hasMore}
              isLoadingMore={editable.storePagination?.isLoadingMore}
            />
          )}

          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <StickyNote className="h-3 w-3 text-text-disabled" />
              Note
            </Label>
            <Input
              placeholder="Add a note (optional)"
              value={editable.note}
              onChange={(e) => editable.onNoteChange(e.target.value)}
              className="min-h-12"
            />
          </div>

          <div className="border-t border-border-light/50 pt-4 space-y-5">
            <PaymentMethodSelector
              paymentMethods={editable.paymentMethods}
              selectedId={editable.selectedPaymentMethodId}
              onSelect={editable.onPaymentMethodSelect}
              isLoading={editable.paymentMethodsLoading}
            />

            <DateTimePicker
              value={editable.recordedAt}
              onChange={editable.onRecordedAtChange}
            />
          </div>

          {data.scope && (
            <div className="border-t border-border-light/50 pt-4">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <p className="text-[11px] text-text-disabled uppercase tracking-wide">
                    Scope
                  </p>
                  <p className="text-sm font-medium text-text mt-0.5">
                    {data.scope}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-5 sm:p-6">
      <h3 className="text-[11px] font-medium text-text-secondary uppercase tracking-wider mb-4">
        Details
      </h3>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <p className="text-[11px] text-text-disabled uppercase tracking-wide">Category</p>
          <p className="text-sm font-medium text-text mt-0.5">{data.category.name}</p>
        </div>
        {isExpense && data.store && (
          <div>
            <p className="text-[11px] text-text-disabled uppercase tracking-wide">Store</p>
            <p className="text-sm font-medium text-text mt-0.5">{data.store.name}</p>
            {data.store.location && (
              <p className="text-xs text-text-secondary">{data.store.location}</p>
            )}
          </div>
        )}
        {data.scope && (
          <div>
            <p className="text-[11px] text-text-disabled uppercase tracking-wide">Scope</p>
            <p className="text-sm font-medium text-text mt-0.5">{data.scope}</p>
          </div>
        )}
        {data.user && (
          <div>
            <p className="text-[11px] text-text-disabled uppercase tracking-wide">By</p>
            <p className="text-sm font-medium text-text mt-0.5">
              {data.user.firstName} {data.user.lastName}
            </p>
          </div>
        )}
        {data.note && (
          <div className="col-span-2 pt-2 border-t border-border-light/50">
            <p className="text-[11px] text-text-disabled uppercase tracking-wide">Description</p>
            <p className="text-sm text-text mt-0.5">{data.note}</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
