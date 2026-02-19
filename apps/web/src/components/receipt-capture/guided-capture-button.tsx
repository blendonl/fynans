import { ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";

const hasGetUserMedia =
  typeof navigator !== "undefined" &&
  !!navigator.mediaDevices?.getUserMedia;

interface GuidedCaptureButtonProps {
  onClick: () => void;
}

export function GuidedCaptureButton({ onClick }: GuidedCaptureButtonProps) {
  if (!hasGetUserMedia) return null;

  return (
    <Button
      className="flex items-center justify-center gap-3 h-14
        bg-gradient-to-r from-[var(--gradient-primary-start)] to-[var(--gradient-primary-end)]
        text-white font-medium shadow-sm"
      onClick={onClick}
    >
      <ScanLine className="h-5 w-5" />
      <span>Guided Capture</span>
    </Button>
  );
}
