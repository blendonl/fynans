"use client";

import { useState } from "react";
import { Camera, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScanReceiptDialog } from "@/components/add-expense/scan-receipt-dialog";
import type { ProcessedReceiptResponse } from "@/hooks/use-receipt-scan";

interface ReceiptScanAreaProps {
  onResult: (data: ProcessedReceiptResponse) => void;
  isPending?: boolean;
  hasScanned?: boolean;
}

export function ReceiptScanArea({ onResult, isPending = false, hasScanned = false }: ReceiptScanAreaProps) {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setShowDialog(true)}
        disabled={isPending}
        className={cn(
          "w-full rounded-2xl border-2 border-dashed p-4 flex items-center gap-3 transition-all cursor-pointer",
          isPending
            ? "border-primary/30 bg-primary/5"
            : hasScanned
              ? "border-income/30 bg-income/5"
              : "border-border hover:border-primary/40 hover:bg-primary/5"
        )}
      >
        <div
          className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
            isPending
              ? "bg-primary/10"
              : hasScanned
                ? "bg-income/10"
                : "bg-surface-variant"
          )}
        >
          {isPending ? (
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
          ) : hasScanned ? (
            <Check className="h-5 w-5 text-income" />
          ) : (
            <Camera className="h-5 w-5 text-text-secondary" />
          )}
        </div>
        <div className="text-left min-w-0">
          <p className={cn(
            "text-sm font-medium",
            hasScanned ? "text-income" : "text-text"
          )}>
            {isPending ? "Processing receipt..." : hasScanned ? "Receipt scanned" : "Scan a receipt"}
          </p>
          <p className="text-xs text-text-secondary">
            {isPending ? "Extracting items and prices" : hasScanned ? "Tap to scan another" : "Take a photo or upload an image"}
          </p>
        </div>
      </button>

      <ScanReceiptDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onResult={onResult}
      />
    </>
  );
}
