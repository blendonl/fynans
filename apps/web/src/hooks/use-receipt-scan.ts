import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { getToken } from "@/lib/auth";
import { customInstance } from "@/api/custom-instance";

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

interface JobStreamEvent {
  status: "waiting" | "active" | "completed" | "failed" | "not_found";
  data?: ProcessedReceiptResponse;
  error?: string;
  progress?: number;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const STREAM_TIMEOUT = 300_000;

function getStepLabel(progress: number): string {
  if (progress < 6) return "Loading your items...";
  if (progress < 90) return "Analyzing receipt...";
  return "Finishing up...";
}

async function streamResult(
  jobId: string,
  onProgress: (progress: number, step: string) => void,
  signal: AbortSignal,
): Promise<ProcessedReceiptResponse> {
  const token = getToken();
  const headers: Record<string, string> = { Accept: "text/event-stream" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}/receipts/jobs/${jobId}/stream`, {
    headers,
    signal,
  });

  if (!response.ok) {
    throw new Error(`Stream failed: ${response.status}`);
  }

  if (!response.body) {
    throw new Error("No response body from stream");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;

      const jsonStr = line.slice(6).trim();
      if (!jsonStr) continue;

      let event: JobStreamEvent;
      try {
        event = JSON.parse(jsonStr);
      } catch {
        continue;
      }

      if (event.status === "completed" && event.data) {
        onProgress(100, "Done!");
        return event.data;
      }

      if (event.status === "failed") {
        throw new Error(event.error || "Receipt processing failed");
      }

      if (event.status === "not_found") {
        throw new Error("Receipt job not found");
      }

      if (event.progress !== undefined) {
        onProgress(event.progress, getStepLabel(event.progress));
      }
    }
  }

  throw new Error("Stream ended without result");
}

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
