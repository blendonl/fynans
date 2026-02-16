/* eslint-disable @typescript-eslint/no-explicit-any */

let cvInstance: typeof cv | null = null;
let loadPromise: Promise<typeof cv> | null = null;

export function loadOpenCV(): Promise<typeof cv> {
  if (cvInstance) return Promise.resolve(cvInstance);
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<typeof cv>((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("OpenCV can only be loaded in a browser environment"));
      return;
    }

    // Already loaded and initialized from a previous session
    if (window.cv && typeof (window.cv as any).Mat === "function") {
      cvInstance = window.cv;
      resolve(cvInstance);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="/opencv/opencv.js"]',
    );
    if (existingScript) {
      waitForCv(resolve, reject);
      return;
    }

    const script = document.createElement("script");
    script.src = "/opencv/opencv.js";
    script.async = true;

    script.onload = () => waitForCv(resolve, reject);

    script.onerror = () => {
      loadPromise = null;
      reject(new Error("Failed to load OpenCV.js script"));
    };

    document.head.appendChild(script);
  });

  loadPromise.catch(() => {
    loadPromise = null;
  });

  return loadPromise;
}

function waitForCv(
  resolve: (instance: typeof cv) => void,
  reject: (err: Error) => void,
) {
  const raw = window.cv as any;

  if (!raw) {
    reject(new Error("OpenCV.js loaded but window.cv is not set"));
    return;
  }

  // Modern Emscripten builds: cv is a thenable (Module with custom .then())
  // or a Promise. Wrap in Promise.resolve() to normalize - Emscripten's .then()
  // returns the Module (not a Promise), so chaining .catch() directly would fail.
  if (typeof raw.then === "function") {
    Promise.resolve(raw)
      .then((module: typeof cv) => {
        cvInstance = module;
        window.cv = module;
        resolve(module);
      })
      .catch((err: unknown) => {
        reject(
          new Error(
            `OpenCV WASM initialization failed: ${err instanceof Error ? err.message : err}`,
          ),
        );
      });
    return;
  }

  // Legacy/asm.js builds: cv is the module directly, but might need onRuntimeInitialized
  if (typeof raw.Mat === "function") {
    cvInstance = raw;
    resolve(raw);
    return;
  }

  // Module is set but not yet initialized - poll for readiness
  const checkReady = setInterval(() => {
    if (typeof raw.Mat === "function") {
      clearInterval(checkReady);
      clearTimeout(timeoutId);
      cvInstance = raw;
      resolve(raw);
    }
  }, 50);

  const timeoutId = setTimeout(() => {
    clearInterval(checkReady);
    reject(new Error("OpenCV runtime initialization timeout"));
  }, 30000);
}
