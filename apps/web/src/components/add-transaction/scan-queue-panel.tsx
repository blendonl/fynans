"use client";

import { FileSearch } from "lucide-react";
import { useScanQueue } from "@/hooks/use-scan-queue";
import { ScanJobCard } from "./scan-job-card";

interface ScanQueuePanelProps {
  showEmptyState?: boolean;
}

export function ScanQueuePanel({ showEmptyState }: ScanQueuePanelProps) {
  const { jobs, activeCount, clearCompleted, retryJob, dismissJob } = useScanQueue();

  const hasCompletedOrFailed = jobs.some(
    (j) => j.status === "completed" || j.status === "failed",
  );

  if (jobs.length === 0) {
    if (!showEmptyState) return null;
    return (
      <div className="rounded-2xl border border-dashed border-border p-6 flex flex-col items-center gap-2 text-center">
        <FileSearch className="h-6 w-6 text-text-disabled" />
        <p className="text-xs text-text-secondary font-medium">No scans yet</p>
        <p className="text-xs text-text-disabled">Scanned receipts will appear here</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-glass-bg backdrop-blur-sm border border-glass-border-outer p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-text">Scan Queue</h3>
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {activeCount}
            </span>
          )}
        </div>
        {hasCompletedOrFailed && (
          <button
            type="button"
            onClick={clearCompleted}
            className="text-xs font-medium text-text-secondary hover:text-text transition-colors cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      <div className="space-y-1.5">
        {jobs.map((job) => (
          <ScanJobCard
            key={job.id}
            job={job}
            onRetry={retryJob}
            onDismiss={dismissJob}
          />
        ))}
      </div>
    </div>
  );
}
