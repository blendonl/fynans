import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { customInstance } from "@/api/custom-instance";
import { streamResult } from "@/lib/receipt-stream";

export interface ProcessedReceiptResponse {
  store: { id?: string; name: string; location: string } | null;
  items: {
    id?: string;
    name: string;
    price: number;
    quantity: number;
    categoryId?: string;
    suggestedItemCategoryId?: string;
    resolvedCategoryId?: string;
    size?: { value: number; unit: string };
  }[];
  recordedAt?: string;
  extractedText: string;
  confidence: number;
  isLowConfidence: boolean;
  suggestedExpenseCategory?: { id: string; name: string };
  pendingExpenseId?: string;
  receiptId?: string;
}

export interface ReceiptScanOptions {
  autoCreatePending?: boolean;
  familyId?: string;
  paymentMethodId?: string;
}

const STREAM_TIMEOUT = 300_000;

export function useReceiptScan(scanOptions?: ReceiptScanOptions) {
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState("");

  const handleProgress = useCallback((p: number, s: string) => {
    setProgress(p);
    setStep(s);
  }, []);

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      setProgress(0);
      setStep("Uploading...");

      const formData = new FormData();
      formData.append("file", file);
      if (scanOptions?.autoCreatePending) formData.append("autoCreatePending", "true");
      if (scanOptions?.familyId) formData.append("familyId", scanOptions.familyId);
      if (scanOptions?.paymentMethodId) formData.append("paymentMethodId", scanOptions.paymentMethodId);

      const res = await customInstance<{ data: { jobId: string; receiptId?: string }; status: number; headers: Headers }>(
        "/receipts/process",
        { method: "POST", body: formData },
      );
      const { jobId, receiptId } = res.data;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), STREAM_TIMEOUT);

      try {
        const result = await streamResult(jobId, handleProgress, controller.signal);
        if (receiptId) result.receiptId = receiptId;
        return result;
      } finally {
        clearTimeout(timeout);
      }
    },
    onSettled: () => {
      setProgress(0);
      setStep("");
    },
  });

  return {
    scan: mutation.mutate,
    scanAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    progress,
    step,
    reset: mutation.reset,
  };
}
