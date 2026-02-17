import { useState, useEffect, useCallback } from "react";
import { opencvWorkerBridge } from "@/lib/opencv-worker-bridge";
import type { DetectedCorners, FrameAnalysis } from "@/lib/receipt-image-processing";

interface UseOpenCVWorkerReturn {
  ready: boolean;
  error: string | null;
  analyzeFrame: (imageData: ImageData) => Promise<FrameAnalysis>;
  perspectiveTransform: (
    imageData: ImageData,
    corners: DetectedCorners,
    outWidth: number,
    outHeight: number,
  ) => Promise<{ pixels: ArrayBuffer; width: number; height: number }>;
}

export function useOpenCVWorker(): UseOpenCVWorkerReturn {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    opencvWorkerBridge
      .init()
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load OpenCV worker");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const analyzeFrame = useCallback(
    (imageData: ImageData) => opencvWorkerBridge.analyzeFrame(imageData),
    [],
  );

  const perspectiveTransform = useCallback(
    (
      imageData: ImageData,
      corners: DetectedCorners,
      outWidth: number,
      outHeight: number,
    ) => opencvWorkerBridge.perspectiveTransform(imageData, corners, outWidth, outHeight),
    [],
  );

  return { ready, error, analyzeFrame, perspectiveTransform };
}
