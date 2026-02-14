"use client";

import { useRef } from "react";
import { Camera, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useReceiptScan, type ProcessedReceiptResponse } from "@/hooks/use-receipt-scan";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface ScanReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResult: (data: ProcessedReceiptResponse) => void;
}

export function ScanReceiptDialog({ open, onOpenChange, onResult }: ScanReceiptDialogProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const { scan, isPending, reset } = useReceiptScan();

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

  const handleOpenChange = (isOpen: boolean) => {
    if (isPending) return;
    if (!isOpen) reset();
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Scan Receipt</DialogTitle>
        </DialogHeader>

        {isPending ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-text-secondary">Processing receipt...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-24"
              onClick={() => cameraInputRef.current?.click()}
            >
              <Camera className="h-8 w-8" />
              <span>Take Photo</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-24"
              onClick={() => uploadInputRef.current?.click()}
            >
              <Upload className="h-8 w-8" />
              <span>Upload Image</span>
            </Button>
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
  );
}
