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

/**
 * Orders 4 points as [topLeft, topRight, bottomRight, bottomLeft]
 * using the sum (x+y) and difference (y-x) method.
 */
function orderCorners(
  points: { x: number; y: number }[],
): DetectedCorners {
  // Top-left has the smallest sum of x+y
  // Bottom-right has the largest sum of x+y
  // Top-right has the smallest difference of y-x
  // Bottom-left has the largest difference of y-x
  const sorted = [...points];

  const sums = sorted.map((p) => p.x + p.y);
  const diffs = sorted.map((p) => p.y - p.x);

  const tlIdx = sums.indexOf(Math.min(...sums));
  const brIdx = sums.indexOf(Math.max(...sums));
  const trIdx = diffs.indexOf(Math.min(...diffs));
  const blIdx = diffs.indexOf(Math.max(...diffs));

  return {
    topLeft: sorted[tlIdx],
    topRight: sorted[trIdx],
    bottomRight: sorted[brIdx],
    bottomLeft: sorted[blIdx],
  };
}

export interface FrameAnalysis {
  corners: DetectedCorners | null;
  quality: QualityAssessment;
}

/**
 * Processes a single frame: detects edges and assesses quality in one pass,
 * sharing the grayscale conversion to avoid duplicate work.
 */
export function analyzeFrame(
  cvLib: typeof cv,
  imageData: ImageData,
): FrameAnalysis {
  const src = cvLib.matFromImageData(imageData);
  const gray = new cvLib.Mat();

  try {
    cvLib.cvtColor(src, gray, cvLib.COLOR_RGBA2GRAY);

    const corners = detectEdgesFromGray(cvLib, gray, imageData.width, imageData.height);
    const quality = assessQualityFromGray(cvLib, gray);

    return { corners, quality };
  } finally {
    src.delete();
    gray.delete();
  }
}

/**
 * Detects receipt edges from a pre-computed grayscale Mat.
 */
function detectEdgesFromGray(
  cvLib: typeof cv,
  gray: cv.Mat,
  width: number,
  height: number,
): DetectedCorners | null {
  const blurred = new cvLib.Mat();
  const edges = new cvLib.Mat();
  const closed = new cvLib.Mat();
  const contours = new cvLib.MatVector();
  const hierarchy = new cvLib.Mat();

  // cv.Size is WASM heap-allocated and must be freed, but types lack .delete()
  const ksize = new cvLib.Size(5, 5) as cv.Size & { delete(): void };

  try {
    cvLib.GaussianBlur(gray, blurred, ksize, 0);
    cvLib.Canny(blurred, edges, 75, 200);

    const kernel = cvLib.getStructuringElement(
      cvLib.MORPH_RECT,
      ksize,
    );
    cvLib.morphologyEx(edges, closed, cvLib.MORPH_CLOSE, kernel);
    kernel.delete();

    cvLib.findContours(
      closed,
      contours,
      hierarchy,
      cvLib.RETR_EXTERNAL,
      cvLib.CHAIN_APPROX_SIMPLE,
    );

    const frameArea = width * height;
    let bestContour: DetectedCorners | null = null;
    let bestArea = 0;

    for (let i = 0; i < contours.size(); i++) {
      const contour = contours.get(i);
      try {
        const area = cvLib.contourArea(contour);
        if (area < frameArea * 0.1) continue;

        const peri = cvLib.arcLength(contour, true);
        const approx = new cvLib.Mat();

        try {
          cvLib.approxPolyDP(contour, approx, 0.02 * peri, true);
          if (approx.rows !== 4) continue;

          const points: { x: number; y: number }[] = [];
          for (let j = 0; j < 4; j++) {
            points.push({
              x: approx.data32S[j * 2],
              y: approx.data32S[j * 2 + 1],
            });
          }

          if (!validateAngles(points)) continue;

          if (area > bestArea) {
            bestArea = area;
            bestContour = orderCorners(points);
          }
        } finally {
          approx.delete();
        }
      } finally {
        contour.delete();
      }
    }

    return bestContour;
  } finally {
    ksize.delete();
    blurred.delete();
    edges.delete();
    closed.delete();
    contours.delete();
    hierarchy.delete();
  }
}

/**
 * Validates that all interior angles of a quadrilateral are between 60 and 120 degrees.
 */
function validateAngles(points: { x: number; y: number }[]): boolean {
  for (let i = 0; i < 4; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % 4];
    const p3 = points[(i + 2) % 4];

    const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
    const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };

    const dot = v1.x * v2.x + v1.y * v2.y;
    const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
    const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

    if (mag1 === 0 || mag2 === 0) return false;

    const cosAngle = dot / (mag1 * mag2);
    const angle = Math.acos(Math.max(-1, Math.min(1, cosAngle))) * (180 / Math.PI);

    if (angle < 60 || angle > 120) return false;
  }
  return true;
}

/**
 * Assesses image quality from a pre-computed grayscale Mat.
 */
function assessQualityFromGray(
  cvLib: typeof cv,
  gray: cv.Mat,
): QualityAssessment {
  const laplacian = new cvLib.Mat();
  const meanMat = new cvLib.Mat();
  const stddevMat = new cvLib.Mat();
  const brightnessMat = new cvLib.Mat();
  const brightnessStd = new cvLib.Mat();

  try {
    cvLib.Laplacian(gray, laplacian, cvLib.CV_64F);
    cvLib.meanStdDev(laplacian, meanMat, stddevMat);

    const stddev = stddevMat.data64F[0];
    const blurScore = stddev * stddev;

    cvLib.meanStdDev(gray, brightnessMat, brightnessStd);
    const brightness = brightnessMat.data64F[0];

    return {
      blurScore,
      brightness,
      isBlurry: blurScore < 100,
      isTooDark: brightness < 60,
      isTooBright: brightness > 210,
    };
  } finally {
    laplacian.delete();
    meanMat.delete();
    stddevMat.delete();
    brightnessMat.delete();
    brightnessStd.delete();
  }
}

/**
 * Captures full-resolution frame from video, applies perspective transform if corners detected,
 * and returns a JPEG File.
 */
export async function cropAndTransform(
  cvLib: typeof cv,
  videoEl: HTMLVideoElement,
  corners: DetectedCorners | null,
  processingWidth: number,
): Promise<File> {
  // Capture full-resolution frame
  const canvas = document.createElement("canvas");
  canvas.width = videoEl.videoWidth;
  canvas.height = videoEl.videoHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(videoEl, 0, 0);

  if (!corners) {
    // No edges detected - return full frame
    return canvasToFile(canvas);
  }

  // Scale corners from processing resolution to full resolution
  const scaleX = videoEl.videoWidth / processingWidth;
  const processingHeight =
    (processingWidth * videoEl.videoHeight) / videoEl.videoWidth;
  const scaleY = videoEl.videoHeight / processingHeight;

  const scaledCorners: DetectedCorners = {
    topLeft: {
      x: corners.topLeft.x * scaleX,
      y: corners.topLeft.y * scaleY,
    },
    topRight: {
      x: corners.topRight.x * scaleX,
      y: corners.topRight.y * scaleY,
    },
    bottomRight: {
      x: corners.bottomRight.x * scaleX,
      y: corners.bottomRight.y * scaleY,
    },
    bottomLeft: {
      x: corners.bottomLeft.x * scaleX,
      y: corners.bottomLeft.y * scaleY,
    },
  };

  // Calculate output dimensions from the larger of top/bottom edges and left/right edges
  const widthTop = distance(scaledCorners.topLeft, scaledCorners.topRight);
  const widthBottom = distance(
    scaledCorners.bottomLeft,
    scaledCorners.bottomRight,
  );
  const heightLeft = distance(scaledCorners.topLeft, scaledCorners.bottomLeft);
  const heightRight = distance(
    scaledCorners.topRight,
    scaledCorners.bottomRight,
  );

  const outWidth = Math.round(Math.max(widthTop, widthBottom));
  const outHeight = Math.round(Math.max(heightLeft, heightRight));

  // Get image data and do perspective transform
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const src = cvLib.matFromImageData(imageData);
  const dst = new cvLib.Mat();

  try {
    const srcPoints = cvLib.matFromArray(4, 1, cvLib.CV_32FC2, [
      scaledCorners.topLeft.x, scaledCorners.topLeft.y,
      scaledCorners.topRight.x, scaledCorners.topRight.y,
      scaledCorners.bottomRight.x, scaledCorners.bottomRight.y,
      scaledCorners.bottomLeft.x, scaledCorners.bottomLeft.y,
    ]);

    const dstPoints = cvLib.matFromArray(4, 1, cvLib.CV_32FC2, [
      0, 0,
      outWidth, 0,
      outWidth, outHeight,
      0, outHeight,
    ]);

    const M = cvLib.getPerspectiveTransform(srcPoints, dstPoints);

    const dstSize = new cvLib.Size(outWidth, outHeight) as cv.Size & { delete(): void };

    try {
      cvLib.warpPerspective(
        src,
        dst,
        M,
        dstSize,
      );

      // Draw result to canvas
      const outCanvas = document.createElement("canvas");
      outCanvas.width = outWidth;
      outCanvas.height = outHeight;
      cvLib.imshow(outCanvas, dst);

      return canvasToFile(outCanvas);
    } finally {
      dstSize.delete();
      srcPoints.delete();
      dstPoints.delete();
      M.delete();
    }
  } finally {
    src.delete();
    dst.delete();
  }
}

function distance(
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
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
      0.92,
    );
  });
}
