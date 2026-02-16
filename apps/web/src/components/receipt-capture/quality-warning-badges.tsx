"use client";

import type { QualityAssessment } from "@/lib/receipt-image-processing";
import { AlertTriangle } from "lucide-react";

interface QualityWarningBadgesProps {
  quality: QualityAssessment | null;
}

export function QualityWarningBadges({ quality }: QualityWarningBadgesProps) {
  if (!quality) return null;

  const warnings: string[] = [];
  if (quality.isBlurry) warnings.push("Too blurry");
  if (quality.isTooDark) warnings.push("Too dark");
  if (quality.isTooBright) warnings.push("Too bright");

  if (warnings.length === 0) return null;

  return (
    <div className="absolute right-4 top-16 z-10 flex flex-col gap-2 quality-badges-in">
      {warnings.map((warning) => (
        <div
          key={warning}
          className="flex items-center gap-1.5 rounded-full
            bg-black/50 px-3 py-1.5 text-xs font-medium text-white
            backdrop-blur-md"
        >
          <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
          {warning}
        </div>
      ))}
    </div>
  );
}
