"use client";

import { createContext, useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { customInstance } from "@/api/custom-instance";
import { streamResult } from "@/lib/receipt-stream";
import { queryKeys } from "@/lib/query-keys";
import type { ProcessedReceiptResponse, ReceiptScanOptions } from "@/hooks/use-receipt-scan";

export interface ScanJob {
  id: string;
  file: File;
  thumbnailUrl: string;
  status: "uploading" | "processing" | "completed" | "failed";
  progress: number;
  step: string;
  result?: ProcessedReceiptResponse;
  error?: string;
  createdAt: number;
  options: ReceiptScanOptions;
}

interface ScanQueueContextValue {
  jobs: ScanJob[];
  activeCount: number;
  completedCount: number;
  enqueue: (file: File, thumbnailUrl: string, options: ReceiptScanOptions) => string;
  retryJob: (id: string) => void;
  dismissJob: (id: string) => void;
  clearCompleted: () => void;
}

export const ScanQueueContext = createContext<ScanQueueContextValue | null>(null);

const STREAM_TIMEOUT = 300_000;
const PROGRESS_THROTTLE_MS = 200;

export function ScanQueueProvider({ children }: { children: React.ReactNode }) {
  const [jobs, setJobs] = useState<ScanJob[]>([]);
  const queryClient = useQueryClient();
  const abortControllers = useRef<Map<string, AbortController>>(new Map());

  const updateJob = useCallback((id: string, updates: Partial<ScanJob>) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...updates } : j)));
  }, []);

  const processJob = useCallback(
    async (job: ScanJob) => {
      const controller = new AbortController();
      abortControllers.current.set(job.id, controller);

      let lastProgressUpdate = 0;

      try {
        updateJob(job.id, { status: "uploading", progress: 0, step: "Uploading..." });

        const formData = new FormData();
        formData.append("file", job.file);
        if (job.options.autoCreatePending) formData.append("autoCreatePending", "true");
        if (job.options.familyId) formData.append("familyId", job.options.familyId);
        if (job.options.paymentMethodId) formData.append("paymentMethodId", job.options.paymentMethodId);

        const res = await customInstance<{
          data: { jobId: string; receiptId?: string };
          status: number;
          headers: Headers;
        }>("/receipts/process", { method: "POST", body: formData });

        const { jobId, receiptId } = res.data;

        updateJob(job.id, { status: "processing", step: "Processing..." });

        const timeout = setTimeout(() => controller.abort(), STREAM_TIMEOUT);

        const onProgress = (progress: number, step: string) => {
          const now = Date.now();
          if (now - lastProgressUpdate < PROGRESS_THROTTLE_MS && progress < 100) return;
          lastProgressUpdate = now;
          updateJob(job.id, { progress, step });
        };

        try {
          const result = await streamResult(jobId, onProgress, controller.signal);
          if (receiptId) result.receiptId = receiptId;

          updateJob(job.id, {
            status: "completed",
            progress: 100,
            step: "Done!",
            result,
          });

          queryClient.invalidateQueries({ queryKey: queryKeys.pending.all });
          queryClient.invalidateQueries({ queryKey: queryKeys.pending.count() });

          const storeName = result.store?.name;
          const itemCount = result.items?.length ?? 0;
          const total = result.items?.reduce((sum, i) => sum + i.price * i.quantity, 0) ?? 0;
          const summary = storeName
            ? `${itemCount} item${itemCount !== 1 ? "s" : ""} from ${storeName} · $${total.toFixed(2)}`
            : `${itemCount} item${itemCount !== 1 ? "s" : ""} · $${total.toFixed(2)}`;

          if (result.pendingExpenseId) {
            toast.success(`Receipt processed: ${summary}`, {
              action: {
                label: "Review",
                onClick: () => {
                  window.location.href = `/transactions/pending/${result.pendingExpenseId}`;
                },
              },
            });
          } else {
            toast.success(`Receipt processed: ${summary}`);
          }
        } finally {
          clearTimeout(timeout);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to process receipt";
        updateJob(job.id, { status: "failed", error: message, step: "" });
        toast.error(`Scan failed: ${message}`);
      } finally {
        abortControllers.current.delete(job.id);
      }
    },
    [updateJob, queryClient],
  );

  const enqueue = useCallback(
    (file: File, thumbnailUrl: string, options: ReceiptScanOptions): string => {
      const id = `scan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const job: ScanJob = {
        id,
        file,
        thumbnailUrl,
        status: "uploading",
        progress: 0,
        step: "Uploading...",
        createdAt: Date.now(),
        options,
      };

      setJobs((prev) => [job, ...prev]);
      processJob(job);
      return id;
    },
    [processJob],
  );

  const retryJob = useCallback(
    (id: string) => {
      setJobs((prev) => {
        const job = prev.find((j) => j.id === id);
        if (!job || job.status !== "failed") return prev;
        const retried: ScanJob = {
          ...job,
          status: "uploading",
          progress: 0,
          step: "Uploading...",
          error: undefined,
          result: undefined,
        };
        processJob(retried);
        return prev.map((j) => (j.id === id ? retried : j));
      });
    },
    [processJob],
  );

  const dismissJob = useCallback((id: string) => {
    const controller = abortControllers.current.get(id);
    if (controller) controller.abort();
    setJobs((prev) => {
      const job = prev.find((j) => j.id === id);
      if (job?.thumbnailUrl) URL.revokeObjectURL(job.thumbnailUrl);
      return prev.filter((j) => j.id !== id);
    });
  }, []);

  const clearCompleted = useCallback(() => {
    setJobs((prev) => {
      const cleared = prev.filter((j) => j.status === "completed" || j.status === "failed");
      cleared.forEach((j) => {
        if (j.thumbnailUrl) URL.revokeObjectURL(j.thumbnailUrl);
      });
      return prev.filter((j) => j.status !== "completed" && j.status !== "failed");
    });
  }, []);

  const activeCount = jobs.filter((j) => j.status === "uploading" || j.status === "processing").length;
  const completedCount = jobs.filter((j) => j.status === "completed").length;

  return (
    <ScanQueueContext.Provider
      value={{ jobs, activeCount, completedCount, enqueue, retryJob, dismissJob, clearCompleted }}
    >
      {children}
    </ScanQueueContext.Provider>
  );
}
