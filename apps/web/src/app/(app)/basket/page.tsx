"use client";

import { useState, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";
import { BasketTabBar } from "@/components/basket/basket-tab-bar";
import { BasketAddItemInput } from "@/components/basket/basket-add-item-input";
import { BasketItemList } from "@/components/basket/basket-item-list";
import { BasketCheckoutBar } from "@/components/basket/basket-checkout-bar";
import {
  BasketCheckoutDialog,
  type CheckoutLineItem,
} from "@/components/basket/basket-checkout-dialog";
import { useBaskets } from "@/hooks/use-baskets";
import { useBasketMutations } from "@/hooks/use-basket-mutations";
import { useBasketWebSocket } from "@/hooks/use-basket-websocket";

export default function BasketPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { baskets, isLoading } = useBaskets();
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Active basket from URL or first basket
  const activeIdFromUrl = searchParams.get("basket");
  const activeBasket = useMemo(() => {
    if (activeIdFromUrl) {
      return baskets.find((b) => b.id === activeIdFromUrl) ?? baskets[0] ?? null;
    }
    return baskets[0] ?? null;
  }, [baskets, activeIdFromUrl]);

  const { addItem, updateItem, removeItem, checkout } = useBasketMutations(
    activeBasket?.id ?? null
  );

  // Subscribe to family room for real-time updates
  useBasketWebSocket(
    activeBasket?.scope === "FAMILY" ? activeBasket.familyId : null
  );

  const handleTabSelect = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("basket", id);
      router.replace(`/basket?${params.toString()}`);
      setCheckedIds(new Set());
    },
    [router, searchParams]
  );

  const handleToggle = useCallback((id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleAddItem = useCallback(
    (name: string) => {
      addItem.mutate(
        { name },
        {
          onError: (err) => toast.error(err.message),
        }
      );
    },
    [addItem]
  );

  const handleUpdateItem = useCallback(
    (data: { itemId: string; price?: number | null; quantity?: number; name?: string }) => {
      const { itemId, ...rest } = data;
      updateItem.mutate(
        { itemId, ...rest },
        {
          onError: (err) => toast.error(err.message),
        }
      );
    },
    [updateItem]
  );

  const handleRemoveItem = useCallback(
    (id: string) => {
      removeItem.mutate(id, {
        onSuccess: () => {
          setCheckedIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        },
        onError: (err) => toast.error(err.message),
      });
    },
    [removeItem]
  );

  const checkedItems = useMemo(
    () =>
      (activeBasket?.items ?? []).filter((item) => checkedIds.has(item.id)),
    [activeBasket?.items, checkedIds]
  );

  const handleCheckout = useCallback(
    (params: {
      categoryId: string;
      storeId?: string;
      lineItems: CheckoutLineItem[];
    }) => {
      const itemIds = Array.from(checkedIds);
      checkout.mutate(
        {
          itemIds,
          categoryId: params.categoryId,
          storeId: params.storeId,
          itemOverrides: params.lineItems.map((li) => ({
            id: li.id,
            price: li.price ?? undefined,
            quantity: li.quantity,
            categoryId: li.categoryId,
          })),
        },
        {
          onSuccess: () => {
            toast.success("Expense created successfully");
            setCheckedIds(new Set());
            setCheckoutOpen(false);
          },
          onError: (err) => toast.error(err.message),
        }
      );
    },
    [checkout, checkedIds]
  );

  return (
    <div className="space-y-6 pb-24">
      <PageHeader
        label="Shopping"
        title="Basket"
        description="Manage your shopping list and create expenses from purchased items."
        className="dash-animate-in"
      />

      {/* Tab bar */}
      <div className="dash-animate-in dash-delay-1">
        <BasketTabBar
          baskets={baskets}
          activeId={activeBasket?.id ?? null}
          onSelect={handleTabSelect}
        />
      </div>

      {/* Add item input */}
      <div className="dash-animate-in dash-delay-2">
        <BasketAddItemInput onAdd={handleAddItem} />
      </div>

      {/* Items list */}
      <div className="dash-animate-in dash-delay-3">
        <BasketItemList
          items={activeBasket?.items ?? []}
          checkedIds={checkedIds}
          onToggle={handleToggle}
          onUpdate={handleUpdateItem}
          onRemove={handleRemoveItem}
          isLoading={isLoading}
        />
      </div>

      {/* Checkout bar */}
      <BasketCheckoutBar
        checkedItems={checkedItems}
        onCheckout={() => setCheckoutOpen(true)}
      />

      {/* Checkout dialog */}
      <BasketCheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        checkedItems={checkedItems}
        onConfirm={handleCheckout}
        isLoading={checkout.isPending}
      />
    </div>
  );
}
