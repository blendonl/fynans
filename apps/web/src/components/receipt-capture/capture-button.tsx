"use client";

import { Loader2 } from "lucide-react";

interface CaptureButtonProps {
  onCapture: () => void;
  disabled: boolean;
  isProcessing: boolean;
}

export function CaptureButton({
  onCapture,
  disabled,
  isProcessing,
}: CaptureButtonProps) {
  return (
    <button
      onClick={onCapture}
      disabled={disabled || isProcessing}
      className="relative flex h-[72px] w-[72px] items-center justify-center rounded-full
        bg-gradient-to-br from-[var(--gradient-primary-start)] to-[var(--gradient-primary-end)]
        shadow-lg shadow-black/30 transition-all duration-150
        active:scale-95 disabled:opacity-40 disabled:active:scale-100"
      aria-label="Capture receipt"
    >
      {isProcessing ? (
        <Loader2 className="h-7 w-7 animate-spin text-white" />
      ) : (
        <div className="h-[58px] w-[58px] rounded-full border-[3px] border-white/90" />
      )}
    </button>
  );
}
