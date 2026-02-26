"use client";

import { useRef, useState, useCallback } from "react";
import { Camera, Upload } from "lucide-react";
import { toast } from "sonner";
import type { PaymentMethod } from "@/hooks/use-payment-methods";
import type { ReceiptScanOptions } from "@/hooks/use-receipt-scan";
import { useScanQueue } from "@/hooks/use-scan-queue";
import { RECEIPT_MAX_FILE_SIZE, RECEIPT_ALLOWED_MIME_TYPES } from "@/constants/receipt";
import { GuidedCameraOverlay } from "@/components/receipt-capture/guided-camera-overlay";
import { ReceiptCropOverlay } from "@/components/receipt-capture/receipt-crop-overlay";
import { cn } from "@/lib/utils";

const hasCamera =
  typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;

interface ScanHeroProps {
  paymentMethods: PaymentMethod[];
  paymentMethodsLoading?: boolean;
  scope: "PERSONAL" | "FAMILY";
  familyId: string;
  paymentMethodId: string;
}

export function ScanHero({
  paymentMethods,
  paymentMethodsLoading,
  scope,
  familyId,
  paymentMethodId,
}: ScanHeroProps) {
  const { enqueue } = useScanQueue();
  const uploadRef = useRef<HTMLInputElement>(null);
  const mobileUploadRef = useRef<HTMLInputElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [pendingCropFile, setPendingCropFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const selectedPayment = paymentMethods.find((m) => m.id === paymentMethodId);
  const hasPaymentMethod = !!paymentMethodId && !!selectedPayment;
  const canScan = hasPaymentMethod && !paymentMethodsLoading;

  const buildOptions = useCallback((): ReceiptScanOptions => ({
    autoCreatePending: true,
    familyId: scope === "FAMILY" ? familyId : undefined,
    paymentMethodId: paymentMethodId || undefined,
  }), [scope, familyId, paymentMethodId]);

  const enqueueFile = useCallback(
    (file: File) => {
      if (!canScan) {
        toast.error("Select a payment method before scanning");
        return;
      }
      if (!RECEIPT_ALLOWED_MIME_TYPES.includes(file.type)) {
        toast.error("Only JPEG and PNG images are allowed");
        return;
      }
      if (file.size > RECEIPT_MAX_FILE_SIZE) {
        toast.error("File size must be under 100MB");
        return;
      }
      const thumbnailUrl = URL.createObjectURL(file);
      enqueue(file, thumbnailUrl, buildOptions());
    },
    [enqueue, buildOptions, canScan],
  );

  const handleCameraCapture = useCallback(
    (file: File) => {
      setShowCamera(false);
      setPendingCropFile(file);
    },
    [],
  );

  const handleCropConfirm = useCallback(
    (croppedFile: File) => {
      setPendingCropFile(null);
      enqueueFile(croppedFile);
    },
    [enqueueFile],
  );

  const handleUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPendingCropFile(file);
    e.target.value = "";
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) setPendingCropFile(file);
    },
    [],
  );

  if (showCamera) {
    return (
      <GuidedCameraOverlay
        onCapture={handleCameraCapture}
        onClose={() => setShowCamera(false)}
      />
    );
  }

  if (pendingCropFile) {
    return (
      <ReceiptCropOverlay
        imageFile={pendingCropFile}
        onConfirm={handleCropConfirm}
        onClose={() => setPendingCropFile(null)}
      />
    );
  }

  return (
    <div className="dash-animate-in">
      {/* Mobile: just the button, no card */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => canScan ? mobileUploadRef.current?.click() : toast.error("Select a payment method before scanning")}
          disabled={!canScan}
          className={cn(
            "w-full h-14 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2.5 shadow-md transition-all cursor-pointer",
            canScan
              ? "bg-gradient-to-br from-primary to-primary-variant text-white hover:shadow-lg active:scale-[0.97]"
              : "bg-surface-variant text-text-disabled cursor-not-allowed shadow-none",
          )}
        >
          <Camera className="h-5 w-5" />
          Scan Receipt
        </button>
        <p className="text-xs text-text-secondary text-center mt-2">
          or tap <span className="font-medium">Add manually</span> below
        </p>
        <input
          ref={mobileUploadRef}
          type="file"
          accept="image/jpeg,image/png"
          capture="environment"
          className="hidden"
          onChange={handleUploadChange}
        />
      </div>

      {/* Desktop: card with drop zone + buttons */}
      <div className="hidden lg:block rounded-3xl bg-surface border border-border-light shadow-sm p-6 space-y-5">
        <div
          className={cn(
            "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed transition-colors py-12 px-6",
            isDragOver
              ? "border-primary bg-primary/[0.05]"
              : canScan
                ? "border-border hover:border-primary/40"
                : "border-border-light",
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="h-8 w-8 text-text-disabled" />
          <div className="text-center">
            <p className="text-sm font-medium text-text-secondary">
              Drop your receipt here
            </p>
            <p className="text-xs text-text-disabled mt-1">
              or choose below
            </p>
          </div>
        </div>

        <div className="flex flex-row justify-center gap-4">
          {hasCamera && (
            <button
              type="button"
              onClick={() => canScan ? setShowCamera(true) : toast.error("Select a payment method before scanning")}
              disabled={!canScan}
              className={cn(
                "font-semibold text-sm flex items-center justify-center gap-2.5 shadow-md transition-all cursor-pointer px-8 h-12 rounded-xl",
                canScan
                  ? "bg-gradient-to-br from-primary to-primary-variant text-white hover:shadow-lg active:scale-[0.97]"
                  : "bg-surface-variant text-text-disabled cursor-not-allowed shadow-none",
              )}
            >
              <Camera className="h-5 w-5" />
              Scan Receipt
            </button>
          )}

          <button
            type="button"
            onClick={() => canScan ? uploadRef.current?.click() : toast.error("Select a payment method before scanning")}
            disabled={!canScan}
            className={cn(
              "rounded-xl border font-medium text-sm flex items-center justify-center gap-2 transition-all cursor-pointer px-8 h-12",
              canScan
                ? "border-border text-text-secondary hover:border-primary/40 hover:text-text hover:bg-primary/[0.03]"
                : "border-border-light text-text-disabled cursor-not-allowed",
            )}
          >
            <Upload className="h-4 w-4" />
            Upload Image
          </button>
        </div>

        <input
          ref={uploadRef}
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={handleUploadChange}
        />
      </div>
    </div>
  );
}
