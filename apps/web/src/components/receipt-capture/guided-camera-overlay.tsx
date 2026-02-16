"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useCameraStream } from "@/hooks/use-camera-stream";
import { useOpenCV } from "@/hooks/use-opencv";
import {
  analyzeFrame,
  cropAndTransform,
  type DetectedCorners,
  type QualityAssessment,
} from "@/lib/receipt-image-processing";
import { ReceiptGuideOverlay } from "./receipt-guide-overlay";
import { QualityWarningBadges } from "./quality-warning-badges";
import { CaptureButton } from "./capture-button";

const PROCESSING_WIDTH = 640;
const FRAME_INTERVAL_MS = 200;

type OverlayState = "loading" | "previewing" | "capturing";

interface GuidedCameraOverlayProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export function GuidedCameraOverlay({
  onCapture,
  onClose,
}: GuidedCameraOverlayProps) {
  const [state, setState] = useState<OverlayState>("loading");
  const [corners, setCorners] = useState<DetectedCorners | null>(null);
  const [quality, setQuality] = useState<QualityAssessment | null>(null);
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });
  const [processingSize, setProcessingSize] = useState({
    width: 0,
    height: 0,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const lastFrameTime = useRef<number>(0);

  const { videoRef, error: cameraError, isLoading: cameraLoading } =
    useCameraStream(true);

  // Only load OpenCV after camera is previewing to avoid blocking the main
  // thread with 9.8MB script parse during camera init
  const cameraReady = state === "previewing";
  const {
    cv: cvLib,
    isLoading: cvLoading,
    error: cvError,
  } = useOpenCV(cameraReady);

  // Track if component is mounted
  const mountedRef = useRef(true);
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Handle camera errors
  useEffect(() => {
    if (cameraError) {
      toast.error(cameraError);
      onClose();
    }
  }, [cameraError, onClose]);

  // Handle OpenCV errors (non-fatal - fall back to raw capture)
  useEffect(() => {
    if (cvError) {
      toast.warning("Advanced features unavailable - capturing without edge detection");
    }
  }, [cvError]);

  // Update state based on loading progress - transition to previewing
  // when camera is actually playing (not just metadata loaded)
  useEffect(() => {
    if (cameraLoading || cameraError) return;

    const video = videoRef.current;
    if (!video) return;

    // If video is already playing with dimensions, transition immediately
    if (video.videoWidth > 0 && !video.paused) {
      setState("previewing");
      return;
    }

    // Listen for the playing event (fires when playback actually starts)
    const onPlaying = () => {
      if (video.videoWidth > 0) setState("previewing");
    };
    // Also listen for loadedmetadata as fallback (in case playing already fired)
    const onMeta = () => {
      if (!video.paused && video.videoWidth > 0) setState("previewing");
    };

    video.addEventListener("playing", onPlaying);
    video.addEventListener("loadedmetadata", onMeta);
    return () => {
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("loadedmetadata", onMeta);
    };
  }, [cameraLoading, cameraError, videoRef]);

  // Set up processing canvas and display dimensions
  const updateDimensions = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;

    // Processing canvas at reduced resolution
    const aspectRatio = video.videoHeight / video.videoWidth;
    const procWidth = PROCESSING_WIDTH;
    const procHeight = Math.round(procWidth * aspectRatio);
    setProcessingSize({ width: procWidth, height: procHeight });

    if (canvasRef.current) {
      canvasRef.current.width = procWidth;
      canvasRef.current.height = procHeight;
    }

    // Display fills the viewport
    setDisplaySize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, [videoRef]);

  // Initialize dimensions once when video metadata loads
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoaded = () => updateDimensions();

    // If already loaded (e.g., remount), call immediately
    if (video.videoWidth > 0) updateDimensions();

    video.addEventListener("loadedmetadata", onLoaded);
    return () => video.removeEventListener("loadedmetadata", onLoaded);
  }, [videoRef, updateDimensions]);

  // Frame processing loop
  useEffect(() => {
    if (state !== "previewing") return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const processFrame = (timestamp: number) => {
      if (!mountedRef.current || state !== "previewing") return;

      // Throttle to FRAME_INTERVAL_MS
      if (timestamp - lastFrameTime.current < FRAME_INTERVAL_MS) {
        rafRef.current = requestAnimationFrame(processFrame);
        return;
      }
      lastFrameTime.current = timestamp;

      // Make sure video has dimensions and canvas is sized
      if (video.videoWidth === 0 || canvas.width === 0) {
        rafRef.current = requestAnimationFrame(processFrame);
        return;
      }

      // Draw video frame to processing canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Run OpenCV processing if available
      if (cvLib) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        try {
          const result = analyzeFrame(cvLib, imageData);
          setCorners(result.corners);
          setQuality(result.quality);
        } catch {
          // Silently handle processing errors - don't crash the preview
        }
      }

      rafRef.current = requestAnimationFrame(processFrame);
    };

    rafRef.current = requestAnimationFrame(processFrame);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [state, cvLib, videoRef]);

  // Handle capture
  const handleCapture = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    setState("capturing");

    // Stop the processing loop
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    try {
      let file: File;

      if (cvLib && corners) {
        // Perspective transform + crop
        file = await cropAndTransform(
          cvLib,
          video,
          corners,
          processingSize.width,
        );
      } else if (cvLib) {
        // No edges - capture full frame with no transform
        file = await cropAndTransform(cvLib, video, null, processingSize.width);
      } else {
        // No OpenCV - raw canvas capture
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
        file = new File([blob], `receipt-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
      }

      onCapture(file);
    } catch {
      toast.error("Failed to capture image");
      setState("previewing");
    }
  }, [cvLib, corners, videoRef, processingSize.width, onCapture]);

  // Handle close with cleanup
  const handleClose = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    onClose();
  }, [onClose]);

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      setDisplaySize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Only block on camera - OpenCV loads in background after camera starts
  const isLoading = state === "loading" || cameraLoading;
  const isCapturing = state === "capturing";

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black">
      {/* Video feed - no autoPlay to avoid conflicting with programmatic play() */}
      <video
        ref={videoRef}
        playsInline
        muted
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          <p className="mt-4 text-sm text-white/70">Starting camera...</p>
        </div>
      )}

      {/* Edge detection overlay */}
      {state === "previewing" && (
        <ReceiptGuideOverlay
          corners={corners}
          videoWidth={processingSize.width}
          videoHeight={processingSize.height}
          displayWidth={displaySize.width}
          displayHeight={displaySize.height}
        />
      )}

      {/* Quality warnings */}
      {state === "previewing" && <QualityWarningBadges quality={quality} />}

      {/* Top bar: close button */}
      <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between p-4">
        <button
          onClick={handleClose}
          className="flex h-10 w-10 items-center justify-center rounded-full
            bg-black/40 text-white backdrop-blur-md transition-colors
            hover:bg-black/60"
          aria-label="Close camera"
        >
          <X className="h-5 w-5" />
        </button>

        {corners && state === "previewing" && (
          <span className="rounded-full bg-black/40 px-3 py-1.5 text-xs font-medium text-emerald-400 backdrop-blur-md">
            Receipt detected
          </span>
        )}
      </div>

      {/* Bottom bar: capture button */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center pb-10 pt-6">
        <CaptureButton
          onCapture={handleCapture}
          disabled={isLoading}
          isProcessing={isCapturing}
        />
      </div>
    </div>,
    document.body,
  );
}
