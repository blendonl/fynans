"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/currency";
import type { Category } from "@/types";
import { transactionControllerCreate } from "@/api/generated/endpoints/transaction/transaction";
import { useCategories } from "@/hooks/use-categories";
import { useAiCategorySuggestion } from "@/hooks/use-ai-category-suggestion";
import { useAutoAcceptSuggestion } from "@/hooks/use-auto-accept-suggestion";
import { useCreateDialog } from "@/hooks/use-create-dialog";
import { usePaymentMethods } from "@/hooks/use-payment-methods";
import { useAutoSelectPaymentMethod } from "@/hooks/use-auto-select-payment-method";
import { localNow } from "@/lib/date-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategorySelector } from "@/components/add-expense/category-selector";
import { AddCategoryDialog } from "@/components/add-expense/add-category-dialog";
import { AmountHero } from "./amount-hero";
import { DateTimePicker } from "./date-time-picker";
import { PaymentMethodSelector } from "./payment-method-selector";

interface IncomeFormProps {
  onSuccess: () => void;
  scope: "PERSONAL" | "FAMILY";
  familyId: string;
}

export function IncomeForm({ onSuccess, scope, familyId }: IncomeFormProps) {
  const { incomeCategories, isLoading: categoriesLoading, createCategory } = useCategories();
  const { paymentMethods, isLoading: paymentMethodsLoading } = usePaymentMethods();

  const ai = useAiCategorySuggestion();

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useAutoSelectPaymentMethod(paymentMethods);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [recordedAt, setRecordedAt] = useState(localNow);

  const categoryDialog = useCreateDialog();

  // Trigger AI income category suggestion when note changes
  const prevNoteRef = useRef<string>("");
  useEffect(() => {
    if (note !== prevNoteRef.current) {
      prevNoteRef.current = note;
      ai.setIncomeNote(note);
    }
  }, [note, ai]);

  const handleAutoAccept = useCallback(
    (cat: { id: string; name: string }) => setSelectedCategory(cat as Category),
    [],
  );
  useAutoAcceptSuggestion(ai.incomeSuggestion, selectedCategory, incomeCategories, handleAutoAccept);

  const submitMutation = useMutation({
    mutationFn: async () => {
      await transactionControllerCreate({
        type: "INCOME",
        value: parseFloat(amount),
        description: note,
        categoryId: selectedCategory!.id,
        recordedAt: new Date(recordedAt).toISOString(),
        familyId: scope === "FAMILY" ? familyId : undefined,
        paymentMethodId: selectedPaymentMethodId || undefined,
      } as unknown as Parameters<typeof transactionControllerCreate>[0]);
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
    if (!amount || parseFloat(amount) <= 0) return "Enter an amount";
    if (!selectedCategory) return "Select a category to continue";
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
            autoFocus
          />
        </div>

        {/* Right panel — Form fields */}
        <div className="space-y-5 mt-5 lg:mt-0 flex-1 min-w-0">
          {/* Note first */}
          <Input
            placeholder="Add a note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-12"
          />

          {/* Category after note — AI can suggest based on note */}
          <CategorySelector
            categories={incomeCategories}
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
            onClear={() => setSelectedCategory(null)}
            onSearch={() => {}}
            onCreateNew={(name) => categoryDialog.show(name)}
            isLoading={categoriesLoading}
            aiSuggestion={ai.incomeSuggestion}
            onAcceptSuggestion={ai.dismissIncomeSuggestion}
            onDismissSuggestion={ai.dismissIncomeSuggestion}
            isSuggestionLoading={ai.isIncomeLoading}
          />

          {/* Payment method */}
          <PaymentMethodSelector
            paymentMethods={paymentMethods}
            selectedId={selectedPaymentMethodId}
            onSelect={setSelectedPaymentMethodId}
            isLoading={paymentMethodsLoading}
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
      </div>

      {/* Dialog */}
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
    </div>
  );
}
