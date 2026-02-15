import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface ProcessedReceiptResponse {
  store: { id?: string; name: string; location: string } | null;
  items: {
    id?: string;
    name: string;
    price: number;
    quantity: number;
    categoryId?: string;
    suggestedItemCategoryId?: string;
  }[];
  recordedAt?: string;
  extractedText: string;
  confidence: number;
  suggestedExpenseCategory?: { id: string; name: string };
}

interface JobSubmitResponse {
  jobId: string;
  status: string;
}

interface JobPollResponse {
  status: "waiting" | "active" | "completed" | "failed" | "not_found";
  data?: ProcessedReceiptResponse;
  error?: string;
  progress?: number;
}

const POLL_INTERVAL = 1500;
const POLL_TIMEOUT = 300_000;

function getStepLabel(progress: number): string {
  if (progress < 7) return "Reading receipt...";
  if (progress < 10) return "Loading your items...";
  if (progress < 55) return "Analyzing items...";
  if (progress < 90) return "Cleaning up results...";
  return "Finishing up...";
}

async function pollForResult(
  jobId: string,
  onProgress: (progress: number, step: string) => void,
): Promise<ProcessedReceiptResponse> {
  const start = Date.now();

  while (Date.now() - start < POLL_TIMEOUT) {
    const result = (await apiClient.get(`/receipts/jobs/${jobId}`)) as JobPollResponse;

    if (result.status === "completed" && result.data) {
      onProgress(100, "Done!");
      return result.data;
    }

    if (result.status === "failed") {
      throw new Error(result.error || "Receipt processing failed");
    }

    if (result.status === "not_found") {
      throw new Error("Receipt job not found");
    }

    if (result.progress !== undefined) {
      onProgress(result.progress, getStepLabel(result.progress));
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
  }

  throw new Error("Receipt processing timed out");
}

export function useReceiptScan() {
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
      const { jobId } = (await apiClient.post("/receipts/process", formData)) as JobSubmitResponse;
      return pollForResult(jobId, handleProgress);
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
