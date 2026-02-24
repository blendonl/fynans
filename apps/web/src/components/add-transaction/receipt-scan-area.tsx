"use client";

import { useState, useEffect } from "react";
import { Camera, Check, Loader2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScanReceiptDialog } from "@/components/add-expense/scan-receipt-dialog";
import type { ProcessedReceiptResponse, ReceiptScanOptions } from "@/hooks/use-receipt-scan";

interface ReceiptScanAreaProps {
  onResult: (data: ProcessedReceiptResponse) => void;
  isPending?: boolean;
  hasScanned?: boolean;
  scanOptions?: ReceiptScanOptions;
}

export function ReceiptScanArea({ onResult, isPending = false, hasScanned = false, scanOptions }: ReceiptScanAreaProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [receiptImageUrl, setReceiptImageUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (receiptImageUrl) URL.revokeObjectURL(receiptImageUrl);
    };
  }, [receiptImageUrl]);

  const handleImageCaptured = (url: string) => {
    if (receiptImageUrl) URL.revokeObjectURL(receiptImageUrl);
    setReceiptImageUrl(url);
  };

  if (hasScanned && receiptImageUrl) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowDialog(true)}
          className="group w-full rounded-2xl border border-income/20 bg-income/[0.03] p-3 flex items-center gap-3 transition-all cursor-pointer hover:border-income/30 hover:bg-income/[0.06]"
        >
          <div className="relative h-16 w-12 shrink-0 rounded-lg overflow-hidden ring-1 ring-border-light shadow-sm rotate-[-2deg] group-hover:rotate-0 transition-transform">
            <img
              src={receiptImageUrl}
              alt="Scanned receipt"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <div className="absolute bottom-0.5 right-0.5 h-4 w-4 rounded-full bg-income flex items-center justify-center">
              <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
            </div>
          </div>
          <div className="text-left min-w-0 flex-1">
            <p className="text-sm font-medium text-income">Receipt scanned</p>
            <p className="text-xs text-text-secondary">Tap to re-scan</p>
          </div>
          <RotateCcw className="h-4 w-4 text-text-disabled group-hover:text-text-secondary transition-colors shrink-0" />
        </button>

        <ScanReceiptDialog
          open={showDialog}
          onOpenChange={setShowDialog}
          onResult={onResult}
          onImageCaptured={handleImageCaptured}
          scanOptions={scanOptions}
        />
      </>
    );
  }

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
        onImageCaptured={handleImageCaptured}
        scanOptions={scanOptions}
      />
    </>
  );
}
