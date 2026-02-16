"use client";

import type { DetectedCorners } from "@/lib/receipt-image-processing";

interface ReceiptGuideOverlayProps {
  corners: DetectedCorners | null;
  videoWidth: number;
  videoHeight: number;
  displayWidth: number;
  displayHeight: number;
}

export function ReceiptGuideOverlay({
  corners,
  videoWidth,
  videoHeight,
  displayWidth,
  displayHeight,
}: ReceiptGuideOverlayProps) {
  // Scale from processing canvas coordinates to display coordinates
  const scaleX = videoWidth > 0 ? displayWidth / videoWidth : 1;
  const scaleY = videoHeight > 0 ? displayHeight / videoHeight : 1;

  if (corners) {
    const points = [
      corners.topLeft,
      corners.topRight,
      corners.bottomRight,
      corners.bottomLeft,
    ];
    const scaledPoints = points.map((p) => ({
      x: p.x * scaleX,
      y: p.y * scaleY,
    }));
    const pathD = scaledPoints
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
      .join(" ") + " Z";

    return (
      <svg
        className="pointer-events-none absolute inset-0 z-10 receipt-detected-pulse"
        width={displayWidth}
        height={displayHeight}
        viewBox={`0 0 ${displayWidth} ${displayHeight}`}
      >
        <path
          d={pathD}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {scaledPoints.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="6"
            fill="var(--primary)"
            stroke="white"
            strokeWidth="2"
          />
        ))}
      </svg>
    );
  }

  // Default guide: subtle rounded rectangle in receipt aspect ratio (~3:4)
  const guideWidth = displayWidth * 0.75;
  const guideHeight = guideWidth * (4 / 3);
  const guideX = (displayWidth - guideWidth) / 2;
  const guideY = (displayHeight - guideHeight) / 2;

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-10"
      width={displayWidth}
      height={displayHeight}
      viewBox={`0 0 ${displayWidth} ${displayHeight}`}
    >
      <rect
        x={guideX}
        y={guideY}
        width={guideWidth}
        height={guideHeight}
        rx="12"
        ry="12"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeDasharray="12 8"
        opacity="0.5"
      />
      {/* Corner brackets for extra visual guidance */}
      {[
        { x: guideX, y: guideY, dx: 24, dy: 24 },
        { x: guideX + guideWidth, y: guideY, dx: -24, dy: 24 },
        { x: guideX + guideWidth, y: guideY + guideHeight, dx: -24, dy: -24 },
        { x: guideX, y: guideY + guideHeight, dx: 24, dy: -24 },
      ].map((c, i) => (
        <path
          key={i}
          d={`M ${c.x + c.dx} ${c.y} L ${c.x} ${c.y} L ${c.x} ${c.y + c.dy}`}
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.8"
        />
      ))}
    </svg>
  );
}
