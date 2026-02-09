"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { formatCurrency } from "@mmoneymanager/shared";
import type { Category, Store, ExpenseItem } from "@mmoneymanager/shared";
import { apiClient } from "@/lib/api-client";
import { useCategories } from "@/hooks/use-categories";
import { useStores } from "@/hooks/use-stores";
import { useExpenseItems } from "@/hooks/use-expense-items";
import { useFamilies } from "@/hooks/use-families";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CategorySelector } from "@/components/add-expense/category-selector";
import { StoreSelector } from "@/components/add-expense/store-selector";
import { ExpenseItemsForm } from "@/components/add-expense/expense-items-form";
import { FormProgress } from "@/components/add-expense/form-progress";
import { AddCategoryDialog } from "@/components/add-expense/add-category-dialog";
import { AddStoreDialog } from "@/components/add-expense/add-store-dialog";

export default function AddTransactionPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("expense");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-text">Add Transaction</h1>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full">
          <TabsTrigger value="expense" className="flex-1">Expense</TabsTrigger>
          <TabsTrigger value="income" className="flex-1">Income</TabsTrigger>
        </TabsList>
        <TabsContent value="expense">
          <ExpenseForm
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ["transactions"] });
              router.push("/transactions");
            }}
          />
        </TabsContent>
        <TabsContent value="income">
          <IncomeForm
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ["transactions"] });
              router.push("/transactions");
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ExpenseForm({ onSuccess }: { onSuccess: () => void }) {
  const { categories, itemCategories, isLoading: categoriesLoading, createCategory } = useCategories();
  const [storeSearch, setStoreSearch] = useState("");
  const { stores, isLoading: storesLoading, createStore } = useStores(storeSearch);
  const expenseItems = useExpenseItems();
  const { families } = useFamilies();

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isItemized, setIsItemized] = useState(false);
  const [simpleAmount, setSimpleAmount] = useState("");
  const [simpleNote, setSimpleNote] = useState("");
  const [scope, setScope] = useState<"PERSONAL" | "FAMILY">("PERSONAL");
  const [familyId, setFamilyId] = useState<string>("");
  const [recordedAt, setRecordedAt] = useState(new Date().toISOString().slice(0, 16));

  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showStoreDialog, setShowStoreDialog] = useState(false);
  const [newStoreName, setNewStoreName] = useState("");

  const isGroceryExpense = selectedCategory?.isConnectedToStore === true;

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
      const total = isItemized
        ? expenseItems.items.reduce((sum: number, item: ExpenseItem) => sum + (item.price - item.discount) * item.quantity, 0)
        : parseFloat(simpleAmount);
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

  const progressSteps = [
    { label: "Category", completed: selectedCategory !== null, active: selectedCategory === null },
    ...(isGroceryExpense
      ? [{ label: "Store", completed: selectedStore !== null, active: selectedCategory !== null && !selectedStore }]
      : []),
    { label: "Items", completed: expenseItems.items.length > 0, active: selectedCategory !== null && expenseItems.items.length === 0 },
    { label: "Review", completed: false, active: canSubmit() },
  ];

  return (
    <Card className="mt-4">
      <CardContent className="p-6 space-y-6">
        <CategorySelector
          categories={categories}
          selectedCategory={selectedCategory}
          onSelect={setSelectedCategory}
          onClear={() => setSelectedCategory(null)}
          onCreateNew={(name) => { setNewCategoryName(name); setShowCategoryDialog(true); }}
          isLoading={categoriesLoading}
        />

        {selectedCategory && !isItemized && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={simpleAmount}
                onChange={(e) => setSimpleAmount(e.target.value)}
                step="0.01"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label>Note (optional)</Label>
              <Input
                placeholder="What was this expense for?"
                value={simpleNote}
                onChange={(e) => setSimpleNote(e.target.value)}
              />
            </div>
            <Button variant="ghost" className="text-primary" onClick={() => setIsItemized(true)}>
              Break down into items
            </Button>
          </div>
        )}

        {selectedCategory && isItemized && (
          <>
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
              />
            )}

            <ExpenseItemsForm
              items={expenseItems.items}
              currentItem={expenseItems.currentItem}
              itemCategories={itemCategories}
              editingIndex={expenseItems.editingIndex}
              itemErrors={expenseItems.itemErrors}
              onCurrentItemChange={expenseItems.setCurrentItem}
              onAddItem={expenseItems.handleAddItem}
              onEditItem={expenseItems.handleEditItem}
              onCancelEdit={expenseItems.cancelEdit}
              onRemoveItem={expenseItems.handleRemoveItem}
            />
          </>
        )}

        {selectedCategory && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Scope</Label>
                <Select value={scope} onValueChange={(v) => setScope(v as "PERSONAL" | "FAMILY")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERSONAL">Personal</SelectItem>
                    <SelectItem value="FAMILY">Family</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {scope === "FAMILY" && (
                <div className="space-y-2">
                  <Label>Family</Label>
                  <Select value={familyId} onValueChange={setFamilyId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select family" />
                    </SelectTrigger>
                    <SelectContent>
                      {families.map((f) => (
                        <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Date & Time</Label>
              <Input
                type="datetime-local"
                value={recordedAt}
                onChange={(e) => setRecordedAt(e.target.value)}
              />
            </div>

            <Button
              className="w-full"
              onClick={() => submitMutation.mutate()}
              loading={submitMutation.isPending}
              disabled={!canSubmit()}
            >
              Create Expense
            </Button>
          </>
        )}

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
      </CardContent>
    </Card>
  );
}

function IncomeForm({ onSuccess }: { onSuccess: () => void }) {
  const { categories, isLoading: categoriesLoading, createCategory } = useCategories();
  const { families } = useFamilies();

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [scope, setScope] = useState<"PERSONAL" | "FAMILY">("PERSONAL");
  const [familyId, setFamilyId] = useState<string>("");
  const [recordedAt, setRecordedAt] = useState(new Date().toISOString().slice(0, 16));

  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const submitMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post("/transactions", {
        type: "INCOME",
        value: parseFloat(amount),
        description,
        categoryId: selectedCategory!.id,
        recordedAt: new Date(recordedAt).toISOString(),
        familyId: scope === "FAMILY" ? familyId : undefined,
      });
    },
    onSuccess: () => {
      toast.success(`Income created: ${formatCurrency(parseFloat(amount))}`);
      onSuccess();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create income");
    },
  });

  const canSubmit = selectedCategory && amount && parseFloat(amount) > 0;

  return (
    <Card className="mt-4">
      <CardContent className="p-6 space-y-6">
        <CategorySelector
          categories={categories}
          selectedCategory={selectedCategory}
          onSelect={setSelectedCategory}
          onClear={() => setSelectedCategory(null)}
          onCreateNew={(name) => { setNewCategoryName(name); setShowCategoryDialog(true); }}
          isLoading={categoriesLoading}
        />

        {selectedCategory && (
          <>
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.01"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                placeholder="What was this income for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Scope</Label>
                <Select value={scope} onValueChange={(v) => setScope(v as "PERSONAL" | "FAMILY")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERSONAL">Personal</SelectItem>
                    <SelectItem value="FAMILY">Family</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {scope === "FAMILY" && (
                <div className="space-y-2">
                  <Label>Family</Label>
                  <Select value={familyId} onValueChange={setFamilyId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select family" />
                    </SelectTrigger>
                    <SelectContent>
                      {families.map((f) => (
                        <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Date & Time</Label>
              <Input
                type="datetime-local"
                value={recordedAt}
                onChange={(e) => setRecordedAt(e.target.value)}
              />
            </div>

            <Button
              className="w-full"
              onClick={() => submitMutation.mutate()}
              loading={submitMutation.isPending}
              disabled={!canSubmit}
            >
              Create Income
            </Button>
          </>
        )}

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
      </CardContent>
    </Card>
  );
}
