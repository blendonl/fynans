import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/currency";
import { incomeControllerRecord } from "@/api/generated/endpoints/income/income";
import type { RecordIncomeRequestDto } from "@/api/generated/model";

interface IncomeSubmitArgs {
  amount: string;
  note: string;
  categoryId?: string;
  recordedAt: string;
  scope: "PERSONAL" | "FAMILY";
  familyId: string;
  paymentMethodId: string | null;
}

interface UseIncomeSubmissionOptions {
  onSuccess: () => void;
  onSaveForReview?: () => void;
}

function buildIncomePayload(args: IncomeSubmitArgs, pending?: boolean): RecordIncomeRequestDto {
  return {
    categoryId: args.categoryId!,
    amount: parseFloat(args.amount),
    note: args.note || undefined,
    recordedAt: new Date(args.recordedAt).toISOString(),
    familyId: args.scope === "FAMILY" ? args.familyId : undefined,
    paymentMethodId: args.paymentMethodId || undefined,
    ...(pending ? { pending: true } : {}),
  };
}

export function useIncomeSubmission({ onSuccess, onSaveForReview }: UseIncomeSubmissionOptions) {
  const submitMutation = useMutation({
    mutationFn: async (args: IncomeSubmitArgs) => {
      await incomeControllerRecord(buildIncomePayload(args));
      return args;
    },
    onSuccess: (args) => {
      toast.success(`Income created: ${formatCurrency(parseFloat(args.amount))}`);
      onSuccess();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create income");
    },
  });

  const saveForReviewMutation = useMutation({
    mutationFn: async (args: IncomeSubmitArgs) => {
      await incomeControllerRecord(buildIncomePayload(args, true));
      return args;
    },
    onSuccess: (args) => {
      toast.success(`Income saved for review: ${formatCurrency(parseFloat(args.amount))}`);
      onSaveForReview?.();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save income for review");
    },
  });

  return { submitMutation, saveForReviewMutation };
}
