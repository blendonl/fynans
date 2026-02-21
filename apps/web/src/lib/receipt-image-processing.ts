import { RECEIPT_JPEG_QUALITY } from "@/constants/receipt";

export interface DetectedCorners {
  topLeft: { x: number; y: number };
  topRight: { x: number; y: number };
  bottomRight: { x: number; y: number };
  bottomLeft: { x: number; y: number };
}

export interface QualityAssessment {
  blurScore: number;
  brightness: number;
  isBlurry: boolean;
  isTooDark: boolean;
  isTooBright: boolean;
}

export interface FrameAnalysis {
  corners: DetectedCorners | null;
  quality: QualityAssessment;
}

/**
 * Simple bounding-box crop using only the Canvas API (no OpenCV needed).
 * Falls back to this when OpenCV hasn't loaded yet.
 */
export async function simpleCropFromCanvas(
  canvas: HTMLCanvasElement,
  corners: DetectedCorners,
): Promise<File> {
  const xs = [corners.topLeft.x, corners.topRight.x, corners.bottomRight.x, corners.bottomLeft.x];
  const ys = [corners.topLeft.y, corners.topRight.y, corners.bottomRight.y, corners.bottomLeft.y];

  const minX = Math.max(0, Math.floor(Math.min(...xs)));
  const minY = Math.max(0, Math.floor(Math.min(...ys)));
  const maxX = Math.min(canvas.width, Math.ceil(Math.max(...xs)));
  const maxY = Math.min(canvas.height, Math.ceil(Math.max(...ys)));

  const cropW = maxX - minX;
  const cropH = maxY - minY;

  if (cropW <= 0 || cropH <= 0) {
    return canvasToFile(canvas);
  }

  const out = document.createElement("canvas");
  out.width = cropW;
  out.height = cropH;
  out.getContext("2d")!.drawImage(canvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);

  return canvasToFile(out);
}

function canvasToFile(canvas: HTMLCanvasElement): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
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
      RECEIPT_JPEG_QUALITY,
    );
  });
}
