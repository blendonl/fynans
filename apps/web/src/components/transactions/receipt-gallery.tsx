"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Receipt, ChevronLeft, ChevronRight } from "lucide-react";
import { GlassCard } from "@/components/glass/glass-card";

interface ReceiptGalleryProps {
  images: string[];
}

export function ReceiptGallery({ images }: ReceiptGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const handleLightboxKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (images.length > 1) {
        if (e.key === "ArrowLeft")
          setLightboxIndex((prev) =>
            prev !== null ? (prev - 1 + images.length) % images.length : null,
          );
        if (e.key === "ArrowRight")
          setLightboxIndex((prev) =>
            prev !== null ? (prev + 1) % images.length : null,
          );
      }
    },
    [images.length],
  );

  useEffect(() => {
    if (lightboxIndex === null) return;
    window.addEventListener("keydown", handleLightboxKey);
    return () => window.removeEventListener("keydown", handleLightboxKey);
  }, [lightboxIndex, handleLightboxKey]);

  if (images.length === 0) return null;

  return (
    <>
      <GlassCard className="p-5 sm:p-6">
        <h3 className="text-[11px] font-medium text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
          <Receipt className="h-3.5 w-3.5" />
          Receipt{images.length > 1 ? "s" : ""}
        </h3>
        <div
          className={
            images.length === 1
              ? "flex justify-center"
              : "grid grid-cols-2 md:grid-cols-3 gap-4"
          }
        >
          {images.map((url, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setLightboxIndex(i)}
              className="group relative rounded-2xl overflow-hidden ring-1 ring-border-light cursor-pointer transition-all hover:ring-primary/40 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
              <img
                src={url}
                alt={`Receipt ${i + 1}`}
                className={`object-cover w-full ${images.length === 1 ? "max-h-80 max-w-xs" : "aspect-[3/4]"}`}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Receipt Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 h-10 w-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer z-10"
          >
            <X className="h-5 w-5" />
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(
                    (lightboxIndex - 1 + images.length) % images.length,
                  );
                }}
                className="absolute left-4 h-10 w-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer z-10"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(
                    (lightboxIndex + 1) % images.length,
                  );
                }}
                className="absolute right-4 h-10 w-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer z-10"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {images.length > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs text-white/80 font-medium z-10">
              {lightboxIndex + 1} / {images.length}
            </div>
          )}

          <img
            src={images[lightboxIndex]}
            alt={`Receipt ${lightboxIndex + 1}`}
            className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
