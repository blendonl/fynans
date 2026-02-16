import { useState, useEffect } from "react";
import { loadOpenCV } from "@/lib/opencv-loader";

interface UseOpenCVReturn {
  cv: typeof cv | null;
  isLoading: boolean;
  error: string | null;
}

export function useOpenCV(enabled: boolean = true): UseOpenCVReturn {
  const [instance, setInstance] = useState<typeof cv | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    // Delay OpenCV loading to let camera init complete first
    // (9.8MB script parse can block the main thread)
    const timer = setTimeout(() => {
      loadOpenCV()
        .then((cvInstance) => {
          if (!cancelled) {
            setInstance(cvInstance);
            setIsLoading(false);
          }
        })
        .catch((err) => {
          if (!cancelled) {
            setError(err instanceof Error ? err.message : "Failed to load OpenCV");
            setIsLoading(false);
          }
        });
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [enabled]);

  return { cv: instance, isLoading, error };
}
