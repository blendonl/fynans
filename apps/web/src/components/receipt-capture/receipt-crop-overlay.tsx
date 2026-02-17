"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Check, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useOpenCVWorker } from "@/hooks/use-opencv-worker";
import {
  simpleCropFromCanvas,
  type DetectedCorners,
} from "@/lib/receipt-image-processing";

interface ReceiptCropOverlayProps {
  imageFile: File;
  onConfirm: (croppedFile: File) => void;
  onClose: () => void;
}

type CornerKey = "topLeft" | "topRight" | "bottomRight" | "bottomLeft";
const CORNER_KEYS: CornerKey[] = [
  "topLeft",
  "topRight",
  "bottomRight",
  "bottomLeft",
];
const MAX_DIM = 2048;
const HANDLE_R = 14;
const HANDLE_R_ACTIVE = 20;
const GRAB_R = 40;

export function ReceiptCropOverlay({
  imageFile,
  onConfirm,
  onClose,
}: ReceiptCropOverlayProps) {
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const [displayUrl, setDisplayUrl] = useState<string | null>(null);
  const [sourceCanvas, setSourceCanvas] = useState<HTMLCanvasElement | null>(
    null,
  );
  const [imgDims, setImgDims] = useState<{ w: number; h: number } | null>(
    null,
  );
  const [corners, setCorners] = useState<DetectedCorners | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeCorner, setActiveCorner] = useState<CornerKey | null>(null);
  const draggingRef = useRef<CornerKey | null>(null);
  const cornersRef = useRef(corners);
  cornersRef.current = corners;
  const detectedCornersRef = useRef<DetectedCorners | null>(null);
  const primaryRef = useRef("#6366f1");
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const { ready: workerReady, analyzeFrame, perspectiveTransform } = useOpenCVWorker();

  // Read --primary CSS variable once
  useEffect(() => {
    const v = getComputedStyle(document.documentElement)
      .getPropertyValue("--primary")
      .trim();
    if (v) primaryRef.current = v;
  }, []);

  // --- Load image ---
  useEffect(() => {
    let cancelled = false;
    let rafId = 0;
    const url = URL.createObjectURL(imageFile);
    const img = new Image();

    img.onload = () => {
      if (cancelled) return;
      const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);

      // Show image + default corners immediately (no heavy work)
      setDisplayUrl(url);
      setImgDims({ w, h });
      setCorners(defaultCorners(w, h));

      // Defer heavy canvas creation so the UI paints first
      rafId = requestAnimationFrame(() => {
        if (cancelled) return;
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        c.getContext("2d")!.drawImage(img, 0, 0, w, h);
        setSourceCanvas(c);
      });
    };

    img.onerror = () => {
      if (!cancelled) {
        toast.error("Failed to load image");
        onCloseRef.current();
      }
    };

    img.src = url;
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      img.src = "";
      URL.revokeObjectURL(url);
    };
  }, [imageFile]);

  // --- Edge detection via worker (runs when both worker and sourceCanvas are ready) ---
  useEffect(() => {
    if (!workerReady || !sourceCanvas || sourceCanvas.width <= 0) return;
    let cancelled = false;

    const run = async () => {
      try {
        const DW = 640;
        const scale = DW / sourceCanvas.width;
        const dh = Math.round(sourceCanvas.height * scale);
        const small = document.createElement("canvas");
        small.width = DW;
        small.height = dh;
        const smallCtx = small.getContext("2d")!;
        smallCtx.drawImage(sourceCanvas, 0, 0, DW, dh);
        const data = smallCtx.getImageData(0, 0, DW, dh);

        const analysis = await analyzeFrame(data);

        if (cancelled) return;
        if (analysis.corners) {
          const inv = 1 / scale;
          const scaled: DetectedCorners = {
            topLeft: {
              x: analysis.corners.topLeft.x * inv,
              y: analysis.corners.topLeft.y * inv,
            },
            topRight: {
              x: analysis.corners.topRight.x * inv,
              y: analysis.corners.topRight.y * inv,
            },
            bottomRight: {
              x: analysis.corners.bottomRight.x * inv,
              y: analysis.corners.bottomRight.y * inv,
            },
            bottomLeft: {
              x: analysis.corners.bottomLeft.x * inv,
              y: analysis.corners.bottomLeft.y * inv,
            },
          };
          detectedCornersRef.current = scaled;
          setCorners(scaled);
        }
      } catch {
        /* keep default corners */
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [workerReady, sourceCanvas, analyzeFrame]);

  // --- Layout: where the <img> renders on screen (centered, contained) ---
  const getDrawRect = useCallback(
    (vw: number, vh: number) => {
      if (!imgDims) return null;
      const imgAspect = imgDims.w / imgDims.h;
      const vpAspect = vw / vh;
      if (imgAspect > vpAspect) {
        const dw = vw;
        const dh = vw / imgAspect;
        return { dx: 0, dy: (vh - dh) / 2, dw, dh };
      }
      const dh = vh;
      const dw = vh * imgAspect;
      return { dx: (vw - dw) / 2, dy: 0, dw, dh };
    },
    [imgDims],
  );

  const imgToScreen = useCallback(
    (pt: { x: number; y: number }, vw: number, vh: number) => {
      const r = getDrawRect(vw, vh);
      if (!r || !imgDims) return { x: 0, y: 0 };
      return {
        x: r.dx + (pt.x / imgDims.w) * r.dw,
        y: r.dy + (pt.y / imgDims.h) * r.dh,
      };
    },
    [getDrawRect, imgDims],
  );

  const screenToImg = useCallback(
    (sx: number, sy: number) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const r = getDrawRect(vw, vh);
      if (!r || !imgDims || r.dw === 0 || r.dh === 0) return null;
      return {
        x: Math.max(
          0,
          Math.min(imgDims.w, ((sx - r.dx) / r.dw) * imgDims.w),
        ),
        y: Math.max(
          0,
          Math.min(imgDims.h, ((sy - r.dy) / r.dh) * imgDims.h),
        ),
      };
    },
    [getDrawRect, imgDims],
  );

  // --- Draw overlay only (NOT the image — just dim mask, outline, circles) ---
  const drawOverlay = useCallback(() => {
    const canvas = overlayRef.current;
    if (!canvas || !corners || !imgDims) return;

    const dpr = window.devicePixelRatio || 1;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    canvas.width = vw * dpr;
    canvas.height = vh * dpr;
    canvas.style.width = `${vw}px`;
    canvas.style.height = `${vh}px`;

    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, vw, vh);

    const sc = CORNER_KEYS.map((k) => imgToScreen(corners[k], vw, vh));
    const primary = primaryRef.current;

    // Dim area outside crop (even-odd fill)
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.beginPath();
    ctx.rect(0, 0, vw, vh);
    ctx.moveTo(sc[0].x, sc[0].y);
    ctx.lineTo(sc[1].x, sc[1].y);
    ctx.lineTo(sc[2].x, sc[2].y);
    ctx.lineTo(sc[3].x, sc[3].y);
    ctx.closePath();
    ctx.fill("evenodd");

    // Crop outline
    ctx.strokeStyle = primary;
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(sc[0].x, sc[0].y);
    for (let i = 1; i < 4; i++) ctx.lineTo(sc[i].x, sc[i].y);
    ctx.closePath();
    ctx.stroke();

    // Corner circles
    for (let i = 0; i < sc.length; i++) {
      const pt = sc[i];
      const isActive = activeCorner === CORNER_KEYS[i];
      const r = isActive ? HANDLE_R_ACTIVE : HANDLE_R;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
      ctx.fillStyle = isActive ? "white" : primary;
      ctx.fill();
      ctx.strokeStyle = isActive ? primary : "white";
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  }, [corners, imgDims, imgToScreen, activeCorner]);

  useEffect(() => {
    drawOverlay();
  }, [drawOverlay]);

  useEffect(() => {
    const h = () => drawOverlay();
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, [drawOverlay]);

  // --- Pointer handling on the overlay canvas ---
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const c = cornersRef.current;
      if (!c) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      let best: CornerKey | null = null;
      let bestDist = GRAB_R;
      for (const key of CORNER_KEYS) {
        const s = imgToScreen(c[key], vw, vh);
        const dist = Math.hypot(e.clientX - s.x, e.clientY - s.y);
        if (dist < bestDist) {
          bestDist = dist;
          best = key;
        }
      }
      if (best) {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        draggingRef.current = best;
        setActiveCorner(best);
      }
    },
    [imgToScreen],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const key = draggingRef.current;
      if (!key) return;
      e.preventDefault();
      const pt = screenToImg(e.clientX, e.clientY);
      if (pt) setCorners((prev) => (prev ? { ...prev, [key]: pt } : prev));
    },
    [screenToImg],
  );

  const handlePointerUp = useCallback(() => {
    draggingRef.current = null;
    setActiveCorner(null);
  }, []);

  // --- Confirm crop ---
  const handleConfirm = useCallback(async () => {
    if (!sourceCanvas || !corners) return;

    // Validate that the crop area isn't too small
    const widthTop = distance(corners.topLeft, corners.topRight);
    const widthBottom = distance(corners.bottomLeft, corners.bottomRight);
    const heightLeft = distance(corners.topLeft, corners.bottomLeft);
    const heightRight = distance(corners.topRight, corners.bottomRight);
    const minDim = Math.min(widthTop, widthBottom, heightLeft, heightRight);
    if (minDim < 20) {
      toast.error("Crop area is too small — drag corners further apart");
      return;
    }

    setIsProcessing(true);
    try {
      let croppedFile: File;
      if (workerReady) {
        try {
          croppedFile = await perspectiveTransformToFile(
            sourceCanvas,
            corners,
            perspectiveTransform,
          );
        } catch {
          // Fall back to simple crop on worker error
          croppedFile = await simpleCropFromCanvas(sourceCanvas, corners);
        }
      } else {
        croppedFile = await simpleCropFromCanvas(sourceCanvas, corners);
      }
      onConfirm(croppedFile);
    } catch {
      toast.error("Failed to crop image");
      setIsProcessing(false);
    }
  }, [workerReady, sourceCanvas, corners, onConfirm, perspectiveTransform]);

  const handleResetCorners = useCallback(() => {
    if (!imgDims) return;
    setCorners(detectedCornersRef.current ?? defaultCorners(imgDims.w, imgDims.h));
  }, [imgDims]);

  const isReady = !!displayUrl && !!corners;
  const canConfirm = isReady && !!sourceCanvas;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black touch-none select-none" style={{ pointerEvents: "auto" }}>
      {/* Native <img> for display — browser decodes off main thread */}
      {displayUrl && (
        <img
          src={displayUrl}
          alt="Receipt to crop"
          className="absolute inset-0 m-auto max-h-full max-w-full object-contain"
          draggable={false}
        />
      )}

      {/* Lightweight overlay canvas: dim mask + crop lines + circles + touch */}
      <canvas
        ref={overlayRef}
        className="absolute inset-0"
        style={{ zIndex: 10 }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />

      {/* Loading overlay */}
      {(!isReady || isProcessing) && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          <p className="mt-4 text-sm text-white/70">
            {isProcessing ? "Cropping..." : "Loading..."}
          </p>
        </div>
      )}

      {/* Top bar */}
      <div className="absolute left-0 right-0 top-0 z-30 flex items-center justify-between p-4">
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="flex h-10 w-10 items-center justify-center rounded-full
            bg-black/40 text-white backdrop-blur-md transition-colors
            hover:bg-black/60 active:bg-black/70 disabled:opacity-40"
          aria-label="Cancel crop"
        >
          <X className="h-5 w-5" />
        </button>

        <p className="text-sm text-white/90 font-medium">Adjust corners</p>

        <button
          onClick={handleResetCorners}
          disabled={isProcessing}
          className="flex h-10 w-10 items-center justify-center rounded-full
            bg-black/40 text-white backdrop-blur-md transition-colors
            hover:bg-black/60 active:bg-black/70 disabled:opacity-40"
          aria-label="Reset corners"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Confirm button */}
      <div className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-center pb-10 pt-6">
        <button
          onClick={handleConfirm}
          disabled={!canConfirm || isProcessing}
          className="flex h-[72px] w-[72px] items-center justify-center rounded-full
            bg-gradient-to-br from-[var(--gradient-primary-start)] to-[var(--gradient-primary-end)]
            shadow-lg shadow-black/30 transition-all duration-150
            active:scale-95 disabled:opacity-40 disabled:active:scale-100"
          aria-label="Confirm crop"
        >
          {isProcessing ? (
            <Loader2 className="h-7 w-7 animate-spin text-white" />
          ) : (
            <Check className="h-8 w-8 text-white" />
          )}
        </button>
      </div>
    </div>,
    document.body,
  );
}

function defaultCorners(w: number, h: number): DetectedCorners {
  const margin = 0.05;
  return {
    topLeft: { x: w * margin, y: h * margin },
    topRight: { x: w * (1 - margin), y: h * margin },
    bottomRight: { x: w * (1 - margin), y: h * (1 - margin) },
    bottomLeft: { x: w * margin, y: h * (1 - margin) },
  };
}

function distance(
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

async function perspectiveTransformToFile(
  canvas: HTMLCanvasElement,
  corners: DetectedCorners,
  transform: (
    imageData: ImageData,
    corners: DetectedCorners,
    outWidth: number,
    outHeight: number,
  ) => Promise<{ pixels: ArrayBuffer; width: number; height: number }>,
): Promise<File> {
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

  const widthTop = distance(corners.topLeft, corners.topRight);
  const widthBottom = distance(corners.bottomLeft, corners.bottomRight);
  const heightLeft = distance(corners.topLeft, corners.bottomLeft);
  const heightRight = distance(corners.topRight, corners.bottomRight);

  const outWidth = Math.round(Math.max(widthTop, widthBottom));
  const outHeight = Math.round(Math.max(heightLeft, heightRight));

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const result = await transform(imageData, corners, outWidth, outHeight);

  return pixelsToFile(
    new Uint8ClampedArray(result.pixels),
    result.width,
    result.height,
  );
}

function pixelsToFile(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
): Promise<File> {
  const outCanvas = document.createElement("canvas");
  outCanvas.width = width;
  outCanvas.height = height;
  const ctx = outCanvas.getContext("2d")!;
  const imageData = new ImageData(new Uint8ClampedArray(pixels.buffer as ArrayBuffer), width, height);
  ctx.putImageData(imageData, 0, 0);

  return new Promise((resolve, reject) => {
    outCanvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to create image blob"));
          return;
        }
        resolve(
          new File([blob], `receipt-${Date.now()}.jpg`, {
            type: "image/jpeg",
          }),
        );
      },
      "image/jpeg",
      0.92,
    );
  });
}
