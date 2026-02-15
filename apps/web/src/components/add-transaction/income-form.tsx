"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { formatCurrency } from "@fynans/shared";
import type { Category } from "@fynans/shared";
import { apiClient } from "@/lib/api-client";
import { useCategories } from "@/hooks/use-categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategorySelector } from "@/components/add-expense/category-selector";
import { AddCategoryDialog } from "@/components/add-expense/add-category-dialog";
import { AmountHero } from "./amount-hero";
import { DateTimePicker } from "./date-time-picker";

function localNow() {
  return format(new Date(), "yyyy-MM-dd'T'HH:mm");
}

interface IncomeFormProps {
  onSuccess: () => void;
  scope: "PERSONAL" | "FAMILY";
  familyId: string;
}

export function IncomeForm({ onSuccess, scope, familyId }: IncomeFormProps) {
  const { incomeCategories, isLoading: categoriesLoading, createCategory } = useCategories();

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [recordedAt, setRecordedAt] = useState(localNow);

  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const submitMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post("/transactions", {
        type: "INCOME",
        value: parseFloat(amount),
        description: note,
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

  const validationMessage = () => {
    if (!selectedCategory) return "Select a category to continue";
    if (!amount || parseFloat(amount) <= 0) return "Enter an amount";
    return null;
  };

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:gap-8">
        {/* Left panel — Amount */}
        <div className="lg:w-72 lg:shrink-0 lg:sticky lg:top-6 lg:self-start">
          <AmountHero
            value={amount}
            onChange={setAmount}
            type="income"
            autoFocus={!!selectedCategory}
          />
        </div>

        {/* Right panel — Form fields */}
        <div className="space-y-5 mt-5 lg:mt-0 flex-1 min-w-0">
          {/* Category */}
          <CategorySelector
            categories={incomeCategories}
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
            onClear={() => setSelectedCategory(null)}
            onSearch={() => {}}
            onCreateNew={(name) => { setNewCategoryName(name); setShowCategoryDialog(true); }}
            isLoading={categoriesLoading}
          />

          {/* After category selected */}
          {selectedCategory && (
            <div className="space-y-5 field-slide-down">
              <Input
                placeholder="Add a note (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="min-h-12"
              />

              <DateTimePicker value={recordedAt} onChange={setRecordedAt} />

              <div className="submit-sticky">
                <Button
                  variant="income"
                  className="w-full h-12 text-base font-semibold"
                  onClick={() => submitMutation.mutate()}
                  loading={submitMutation.isPending}
                  disabled={!canSubmit}
                >
                  Create Income
                </Button>
                {!canSubmit && (
                  <p className="text-xs text-text-secondary text-center mt-2">{validationMessage()}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialog */}
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
    </div>
  );
}
