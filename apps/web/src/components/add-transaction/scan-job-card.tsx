"use client";

import { AlertCircle, Check, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ScanJob } from "@/providers/scan-queue-provider";
import { cn } from "@/lib/utils";

interface ScanJobCardProps {
  job: ScanJob;
  onRetry: (id: string) => void;
  onDismiss: (id: string) => void;
}

function formatJobSummary(job: ScanJob): string {
  if (!job.result) return "";
  const { store, items } = job.result;
  const count = items?.length ?? 0;
  const total = items?.reduce((sum, i) => sum + i.price * i.quantity, 0) ?? 0;
  const countLabel = `${count} item${count !== 1 ? "s" : ""}`;
  if (store?.name) return `${countLabel} from ${store.name} · $${total.toFixed(2)}`;
  return `${countLabel} · $${total.toFixed(2)}`;
}

export function ScanJobCard({ job, onRetry, onDismiss }: ScanJobCardProps) {
  const router = useRouter();
  const isActive = job.status === "uploading" || job.status === "processing";

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl p-2.5 transition-colors",
        isActive && "bg-primary/[0.04]",
        job.status === "completed" && "bg-income/[0.04]",
        job.status === "failed" && "bg-error/[0.04]",
      )}
    >
      <div className="relative h-12 w-12 shrink-0 rounded-lg overflow-hidden ring-1 ring-border-light">
        <img
          src={job.thumbnailUrl}
          alt="Receipt thumbnail"
          className="h-full w-full object-cover"
        />
        {isActive && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <Loader2 className="h-4 w-4 text-white animate-spin" />
          </div>
        )}
        {job.status === "completed" && (
          <div className="absolute bottom-0.5 right-0.5 h-4 w-4 rounded-full bg-income flex items-center justify-center">
            <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
          </div>
        )}
        {job.status === "failed" && (
          <div className="absolute bottom-0.5 right-0.5 h-4 w-4 rounded-full bg-error flex items-center justify-center">
            <AlertCircle className="h-2.5 w-2.5 text-white" strokeWidth={3} />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        {isActive && (
          <>
            <p className="text-sm font-medium text-text truncate">{job.step}</p>
            <div className="mt-1 h-1.5 w-full rounded-full bg-surface-variant overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${job.progress}%` }}
              />
            </div>
          </>
        )}

        {job.status === "completed" && (
          <>
            <p className="text-sm font-medium text-text truncate">
              {formatJobSummary(job)}
            </p>
            <button
              type="button"
              onClick={() => {
                if (job.result?.pendingExpenseId) {
                  router.push(`/transactions/pending/${job.result.pendingExpenseId}`);
                }
              }}
              disabled={!job.result?.pendingExpenseId}
              className="text-xs font-medium text-primary hover:text-primary-variant transition-colors cursor-pointer disabled:text-text-disabled disabled:cursor-default"
            >
              Review
            </button>
          </>
        )}

        {job.status === "failed" && (
          <>
            <p className="text-sm font-medium text-error truncate">
              {job.error || "Scan failed"}
            </p>
            <button
              type="button"
              onClick={() => onRetry(job.id)}
              className="text-xs font-medium text-primary hover:text-primary-variant transition-colors cursor-pointer"
            >
              Retry
            </button>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={() => onDismiss(job.id)}
        className="shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-text-disabled hover:text-text-secondary hover:bg-surface-variant transition-colors cursor-pointer"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
