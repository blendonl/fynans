"use client";

import { useRef, useState } from "react";
import { Camera, Upload, Loader2, ScanLine } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useReceiptScan, type ProcessedReceiptResponse } from "@/hooks/use-receipt-scan";
import { GuidedCameraOverlay } from "@/components/receipt-capture/guided-camera-overlay";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const hasGetUserMedia =
  typeof navigator !== "undefined" &&
  !!navigator.mediaDevices?.getUserMedia;

interface ScanReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResult: (data: ProcessedReceiptResponse) => void;
}

export function ScanReceiptDialog({ open, onOpenChange, onResult }: ScanReceiptDialogProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const [showGuidedCapture, setShowGuidedCapture] = useState(false);
  const { scan, isPending, progress, step, reset } = useReceiptScan();

  const handleFile = (file: File) => {
    if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
      toast.error("Only JPEG and PNG images are allowed");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size must be under 10MB");
      return;
    }
    scan(file, {
      onSuccess: (data) => {
        onResult(data);
        onOpenChange(false);
      },
      onError: (err) => {
        toast.error(err.message || "Failed to process receipt");
      },
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const handleGuidedCapture = (file: File) => {
    setShowGuidedCapture(false);
    handleFile(file);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (isPending) return;
    if (!isOpen) {
      reset();
      setShowGuidedCapture(false);
    }
    onOpenChange(isOpen);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scan Receipt</DialogTitle>
          </DialogHeader>

          {isPending ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />

              <div className="w-full max-w-xs space-y-2">
                <div className="h-2 w-full rounded-full bg-surface-variant overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-text-secondary">
                  <span>{step}</span>
                  <span>{progress}%</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 py-4">
              {hasGetUserMedia && (
                <Button
                  className="flex items-center justify-center gap-3 h-14
                    bg-gradient-to-r from-[var(--gradient-primary-start)] to-[var(--gradient-primary-end)]
                    text-white font-medium shadow-sm"
                  onClick={() => setShowGuidedCapture(true)}
                >
                  <ScanLine className="h-5 w-5" />
                  <span>Guided Capture</span>
                </Button>
              )}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-20"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <Camera className="h-6 w-6" />
                  <span className="text-sm">Quick Photo</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-20"
                  onClick={() => uploadInputRef.current?.click()}
                >
                  <Upload className="h-6 w-6" />
                  <span className="text-sm">Upload Image</span>
                </Button>
              </div>
            </div>
          )}

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleInputChange}
          />
          <input
            ref={uploadInputRef}
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={handleInputChange}
          />
        </DialogContent>
      </Dialog>

      {showGuidedCapture && (
        <GuidedCameraOverlay
          onCapture={handleGuidedCapture}
          onClose={() => setShowGuidedCapture(false)}
        />
      )}
    </>
  );
}
