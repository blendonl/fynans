"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Category } from "@/types";
import { useCategories } from "@/hooks/use-categories";
import { useIncomeSubmission } from "@/hooks/use-income-submission";
import { useAiCategorySuggestion } from "@/hooks/use-ai-category-suggestion";
import { useAutoAcceptSuggestion } from "@/hooks/use-auto-accept-suggestion";
import { useCreateDialog } from "@/hooks/use-create-dialog";
import { usePaymentMethods } from "@/hooks/use-payment-methods";
import { useAutoSelectPaymentMethod } from "@/hooks/use-auto-select-payment-method";
import { localNow } from "@/lib/date-utils";
import { Input } from "@/components/ui/input";
import { CategorySelector } from "@/components/add-expense/category-selector";
import { AddCategoryDialog } from "@/components/add-expense/add-category-dialog";
import { AmountHero } from "./amount-hero";
import { DateTimePicker } from "./date-time-picker";
import { PaymentMethodSelector } from "./payment-method-selector";
import { SubmitButtons } from "./submit-buttons";

interface IncomeFormProps {
  onSuccess: () => void;
  onSaveForReview?: () => void;
  scope: "PERSONAL" | "FAMILY";
  familyId: string;
  externalPaymentMethodId?: string;
}

export function IncomeForm({ onSuccess, onSaveForReview, scope, familyId, externalPaymentMethodId }: IncomeFormProps) {
  const { incomeCategories, isLoading: categoriesLoading, createCategory } = useCategories();
  const { paymentMethods, isLoading: paymentMethodsLoading } = usePaymentMethods();
  const { submitMutation, saveForReviewMutation } = useIncomeSubmission({ onSuccess, onSaveForReview });

  const ai = useAiCategorySuggestion();

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [autoPaymentMethodId, setAutoPaymentMethodId] = useAutoSelectPaymentMethod(paymentMethods);
  const selectedPaymentMethodId = externalPaymentMethodId ?? autoPaymentMethodId;
  const setSelectedPaymentMethodId = setAutoPaymentMethodId;
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [recordedAt, setRecordedAt] = useState(localNow);

  const categoryDialog = useCreateDialog();

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

  const getFormArgs = () => ({
    amount,
    note,
    categoryId: selectedCategory?.id,
    recordedAt: new Date(recordedAt).toISOString(),
    scope,
    familyId,
    paymentMethodId: selectedPaymentMethodId,
  });

  const canSubmit = selectedPaymentMethodId && selectedCategory && amount && parseFloat(amount) > 0;
  const canSaveForReview = selectedPaymentMethodId && amount && parseFloat(amount) > 0;

  const validationMessage = () => {
    if (!selectedPaymentMethodId) return "Select a payment method";
    if (!amount || parseFloat(amount) <= 0) return "Enter an amount";
    if (!selectedCategory) return "Select a category to continue";
    return null;
  };

  return (
    <div>
      <div className="flex flex-col">
        <div className="space-y-5 flex-1 min-w-0">
          <AmountHero
            value={amount}
            onChange={setAmount}
            type="income"
            autoFocus
          />

          <Input
            placeholder="Add a note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-12"
          />

          <div className="space-y-5">
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

            {!externalPaymentMethodId && (
              <PaymentMethodSelector
                paymentMethods={paymentMethods}
                selectedId={selectedPaymentMethodId}
                onSelect={setSelectedPaymentMethodId}
                isLoading={paymentMethodsLoading}
              />
            )}
          </div>

          <DateTimePicker value={recordedAt} onChange={setRecordedAt} />

          <SubmitButtons
            type="income"
            canSubmit={!!canSubmit}
            canSaveForReview={!!canSaveForReview}
            isSubmitting={submitMutation.isPending}
            isSavingForReview={saveForReviewMutation.isPending}
            validationMessage={validationMessage()}
            onSubmit={() => submitMutation.mutate(getFormArgs())}
            onSaveForReview={() => saveForReviewMutation.mutate(getFormArgs())}
          />
        </div>
      </div>

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
