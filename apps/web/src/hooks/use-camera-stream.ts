import { useState, useEffect, useRef, useCallback } from "react";

interface UseCameraStreamReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  stream: MediaStream | null;
  error: string | null;
  isLoading: boolean;
  isSupported: boolean;
}

export function useCameraStream(active: boolean): UseCameraStreamReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(active);
  const streamRef = useRef<MediaStream | null>(null);

  const isSupported =
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia;

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    if (!active || !isSupported) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    const waitForVideoReady = (video: HTMLVideoElement): Promise<void> => {
      if (video.readyState >= 1) return Promise.resolve();
      return new Promise((resolve, reject) => {
        const onMeta = () => { cleanup(); resolve(); };
        const onErr = () => { cleanup(); reject(new Error("Video failed to load")); };
        const timeout = setTimeout(() => { cleanup(); reject(new Error("Video metadata timeout")); }, 10_000);
        const cleanup = () => {
          video.removeEventListener("loadedmetadata", onMeta);
          video.removeEventListener("error", onErr);
          clearTimeout(timeout);
        };
        video.addEventListener("loadedmetadata", onMeta, { once: true });
        video.addEventListener("error", onErr, { once: true });
      });
    };

    const attachStream = async (mediaStream: MediaStream) => {
      if (!videoRef.current) return;
      videoRef.current.srcObject = mediaStream;
      await waitForVideoReady(videoRef.current);
      await videoRef.current.play();
    };

    const startCamera = async () => {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      try {
        const mediaStream =
          await navigator.mediaDevices.getUserMedia(constraints);
        if (cancelled) {
          mediaStream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = mediaStream;
        setStream(mediaStream);
        await attachStream(mediaStream);

        setIsLoading(false);
      } catch (err) {
        if (cancelled) return;

        // AbortError from play() is transient (e.g. autoplay conflict) - retry once
        if (err instanceof DOMException && err.name === "AbortError" && streamRef.current) {
          try {
            await attachStream(streamRef.current);
            setIsLoading(false);
            return;
          } catch {
            // Fall through to error handling
          }
        }

        // Retry without facingMode on OverconstrainedError
        if (err instanceof OverconstrainedError) {
          try {
            const fallbackStream =
              await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
                audio: false,
              });
            if (cancelled) {
              fallbackStream.getTracks().forEach((t) => t.stop());
              return;
            }
            streamRef.current = fallbackStream;
            setStream(fallbackStream);
            await attachStream(fallbackStream);

            setIsLoading(false);
            return;
          } catch {
            // Fall through to error handling
          }
        }

        const message =
          err instanceof DOMException && err.name === "NotAllowedError"
            ? "Camera permission denied. Please allow camera access and try again."
            : err instanceof DOMException && err.name === "NotFoundError"
              ? "No camera found on this device."
              : "Could not access camera. Try using Quick Photo or Upload instead.";

        setError(message);
        setIsLoading(false);
      }
    };

    startCamera();

    return () => {
      cancelled = true;
      stopStream();
    };
  }, [active, isSupported, stopStream]);

  // Pause/resume on visibility change
  useEffect(() => {
    if (!active) return;

    const handleVisibility = () => {
      if (document.hidden) {
        // Pause video to save resources
        videoRef.current?.pause();
      } else if (videoRef.current && streamRef.current) {
        videoRef.current.play().catch(() => {});
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [active]);

  return { videoRef, stream, error, isLoading, isSupported };
}
