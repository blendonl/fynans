"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Check } from "lucide-react";
import { useScanQueue } from "@/hooks/use-scan-queue";
import { ScanJobCard } from "@/components/add-transaction/scan-job-card";
import { cn } from "@/lib/utils";

const AUTO_HIDE_DELAY = 10_000;

export function ScanProgressIndicator() {
  const { jobs, activeCount, completedCount, retryJob, dismissJob, clearCompleted } = useScanQueue();
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const interactedRef = useRef(false);
  const totalVisible = activeCount + completedCount + jobs.filter((j) => j.status === "failed").length;

  useEffect(() => {
    if (totalVisible > 0) {
      setVisible(true);
      clearTimeout(hideTimerRef.current);
    }
  }, [totalVisible]);

  useEffect(() => {
    if (activeCount === 0 && totalVisible > 0 && !interactedRef.current) {
      hideTimerRef.current = setTimeout(() => {
        setVisible(false);
        setExpanded(false);
      }, AUTO_HIDE_DELAY);
      return () => clearTimeout(hideTimerRef.current);
    }
  }, [activeCount, totalVisible]);

  if (!visible || totalVisible === 0) return null;

  const handlePillClick = () => {
    interactedRef.current = true;
    clearTimeout(hideTimerRef.current);
    setExpanded((p) => !p);
  };

  const label = activeCount > 0
    ? `${activeCount} scanning...`
    : `${completedCount} ready to review`;

  return (
    <div className="fixed z-40 bottom-[calc(env(safe-area-inset-bottom)+72px)] left-4 sm:bottom-6 sm:left-auto sm:right-6">
      {expanded && (
        <div className="mb-2 w-72 rounded-2xl bg-glass-bg-strong backdrop-blur-lg border border-glass-border-outer shadow-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text">Scan Queue</span>
            <button
              type="button"
              onClick={() => {
                clearCompleted();
                setExpanded(false);
                setVisible(false);
              }}
              className="text-xs text-text-secondary hover:text-text cursor-pointer"
            >
              Clear all
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto space-y-1">
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
      )}

      <button
        type="button"
        onClick={handlePillClick}
        className={cn(
          "flex items-center gap-2 rounded-full px-4 py-2.5",
          "bg-glass-bg-strong backdrop-blur-lg border border-glass-border-outer shadow-lg",
          "text-sm font-medium text-text cursor-pointer transition-all hover:shadow-xl",
          activeCount === 0 && completedCount > 0 && "scan-pulse",
        )}
      >
        {activeCount > 0 ? (
          <Loader2 className="h-4 w-4 text-primary animate-spin" />
        ) : (
          <Check className="h-4 w-4 text-income" />
        )}
        {label}
      </button>
    </div>
  );
}
