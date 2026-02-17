"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { toast } from "sonner";
import { ReceiptGuideOverlay } from "./receipt-guide-overlay";
import { CaptureButton } from "./capture-button";
import { useOpenCVWorker } from "@/hooks/use-opencv-worker";
import type { DetectedCorners } from "@/lib/receipt-image-processing";

interface GuidedCameraOverlayProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

const ANALYSIS_INTERVAL_MS = 400;
const ANALYSIS_WIDTH = 320;

export function GuidedCameraOverlay({
  onCapture,
  onClose,
}: GuidedCameraOverlayProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [displaySize, setDisplaySize] = useState({ w: 0, h: 0 });
  const [detectedCorners, setDetectedCorners] = useState<DetectedCorners | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const { ready: workerReady, analyzeFrame } = useOpenCVWorker();

  // Track viewport size
  useEffect(() => {
    const update = () =>
      setDisplaySize({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  // Start camera on mount, clean up on unmount
  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        }).catch(() =>
          // Fallback without facingMode for desktop / browsers that reject it
          navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
            audio: false,
          })
        );

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;

        video.srcObject = stream;

        // Wait for metadata so videoWidth/Height are set
        await new Promise<void>((resolve, reject) => {
          if (video.readyState >= 1) { resolve(); return; }
          const onMeta = () => { cleanup(); resolve(); };
          const onErr = () => { cleanup(); reject(new Error("Video failed")); };
          const timer = setTimeout(() => { cleanup(); reject(new Error("Timeout")); }, 10_000);
          const cleanup = () => {
            video.removeEventListener("loadedmetadata", onMeta);
            video.removeEventListener("error", onErr);
            clearTimeout(timer);
          };
          video.addEventListener("loadedmetadata", onMeta, { once: true });
          video.addEventListener("error", onErr, { once: true });
        });

        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }

        await video.play();
        if (!cancelled) setReady(true);
      } catch (err) {
        if (cancelled) return;
        const msg =
          err instanceof DOMException && err.name === "NotAllowedError"
            ? "Camera permission denied."
            : err instanceof DOMException && err.name === "NotFoundError"
              ? "No camera found."
              : "Could not start camera.";
        toast.error(msg);
        onCloseRef.current();
      }
    };

    start();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  // Real-time edge detection via OpenCV worker
  useEffect(() => {
    if (!ready || !workerReady) return;

    let cancelled = false;
    let timerId: ReturnType<typeof setTimeout>;
    const sampleCanvas = document.createElement("canvas");

    const analyze = async () => {
      const video = videoRef.current;
      if (!video || video.readyState < 2 || cancelled) {
        timerId = setTimeout(analyze, ANALYSIS_INTERVAL_MS);
        return;
      }

      try {
        const vw = video.videoWidth;
        const vh = video.videoHeight;
        if (vw === 0 || vh === 0) {
          timerId = setTimeout(analyze, ANALYSIS_INTERVAL_MS);
          return;
        }

        const scale = ANALYSIS_WIDTH / vw;
        const sw = ANALYSIS_WIDTH;
        const sh = Math.round(vh * scale);
        sampleCanvas.width = sw;
        sampleCanvas.height = sh;
        const ctx = sampleCanvas.getContext("2d")!;
        ctx.drawImage(video, 0, 0, sw, sh);
        const imageData = ctx.getImageData(0, 0, sw, sh);

        const analysis = await analyzeFrame(imageData);

        if (!cancelled) {
          if (analysis.corners) {
            // Scale corners back to video dimensions
            const inv = 1 / scale;
            setDetectedCorners({
              topLeft: { x: analysis.corners.topLeft.x * inv, y: analysis.corners.topLeft.y * inv },
              topRight: { x: analysis.corners.topRight.x * inv, y: analysis.corners.topRight.y * inv },
              bottomRight: { x: analysis.corners.bottomRight.x * inv, y: analysis.corners.bottomRight.y * inv },
              bottomLeft: { x: analysis.corners.bottomLeft.x * inv, y: analysis.corners.bottomLeft.y * inv },
            });
          } else {
            setDetectedCorners(null);
          }
        }
      } catch {
        // Silently ignore analysis errors — keep showing previous corners or none
      }

      if (!cancelled) {
        timerId = setTimeout(analyze, ANALYSIS_INTERVAL_MS);
      }
    };

    // Start the analysis loop
    timerId = setTimeout(analyze, 200);

    return () => {
      cancelled = true;
      clearTimeout(timerId);
    };
  }, [ready, workerReady, analyzeFrame]);

  const handleCapture = useCallback(async () => {
    const video = videoRef.current;
    if (!video || capturing) return;

    setCapturing(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(video, 0, 0);

      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Failed to capture"))),
          "image/jpeg",
          0.92,
        ),
      );
      const file = new File([blob], `receipt-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });
      onCapture(file);
    } catch {
      toast.error("Failed to capture image");
      setCapturing(false);
    }
  }, [capturing, onCapture]);

  // Fix stale Radix pointer-events on mount
  useEffect(() => {
    if (document.body.style.pointerEvents === "none") {
      document.body.style.pointerEvents = "";
    }
  }, []);

  const video = videoRef.current;
  const videoWidth = video?.videoWidth ?? 0;
  const videoHeight = video?.videoHeight ?? 0;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black">
      <video
        ref={videoRef}
        playsInline
        muted
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Loading state */}
      {!ready && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          <p className="mt-4 text-sm text-white/70">Starting camera...</p>
        </div>
      )}

      {/* Guide overlay with real-time edge detection */}
      {ready && (
        <ReceiptGuideOverlay
          corners={detectedCorners}
          videoWidth={videoWidth}
          videoHeight={videoHeight}
          displayWidth={displaySize.w}
          displayHeight={displaySize.h}
        />
      )}

      {/* Close button */}
      <div className="absolute left-0 right-0 top-0 z-30 flex items-center justify-between p-4">
        <button
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full
            bg-black/40 text-white backdrop-blur-md transition-colors
            hover:bg-black/60 active:bg-black/70"
          aria-label="Close camera"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Capture button */}
      <div className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-center pb-10 pt-6">
        <CaptureButton
          onCapture={handleCapture}
          disabled={!ready}
          isProcessing={capturing}
        />
      </div>
    </div>,
    document.body,
  );
}
