import type {
  WorkerRequest,
  WorkerResponse,
  AnalyzeFrameResponse,
  PerspectiveTransformResponse,
} from "./opencv-worker-types";
import type { DetectedCorners, FrameAnalysis } from "./receipt-image-processing";

interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (reason: Error) => void;
}

class OpenCVWorkerBridge {
  private worker: Worker | null = null;
  private readyPromise: Promise<void> | null = null;
  private pending = new Map<string, PendingRequest>();

  init(): Promise<void> {
    if (this.readyPromise) return this.readyPromise;

    this.readyPromise = new Promise<void>((resolve, reject) => {
      try {
        // Reflect.construct avoids Turbopack TP1001 — no `new Worker(...)` in the AST
        this.worker = Reflect.construct(Worker, [
          "/opencv-worker.js",
        ]) as Worker;
      } catch (err) {
        this.readyPromise = null;
        reject(
          new Error(
            `Failed to create OpenCV worker: ${err instanceof Error ? err.message : err}`,
          ),
        );
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error("OpenCV worker initialization timed out"));
        this.dispose();
      }, 30_000);

      this.worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
        const msg = e.data;

        if (msg.type === "ready") {
          clearTimeout(timeout);
          // Replace with permanent handler
          this.worker!.onmessage = this.handleMessage;
          resolve();
          return;
        }

        // Handle messages that arrive before "ready" swap (shouldn't happen, but safe)
        this.handleMessage(e);
      };

      this.worker.onerror = (err) => {
        clearTimeout(timeout);
        reject(new Error(`OpenCV worker error: ${err.message}`));
        this.dispose();
      };
    });

    return this.readyPromise;
  }

  private handleMessage = (e: MessageEvent<WorkerResponse>) => {
    const msg = e.data;
    if (msg.type === "ready") return;

    const id = msg.id;
    const entry = this.pending.get(id);
    if (!entry) return;

    this.pending.delete(id);

    if (msg.type === "error") {
      entry.reject(new Error(msg.error));
    } else {
      entry.resolve(msg);
    }
  };

  async analyzeFrame(imageData: ImageData): Promise<FrameAnalysis> {
    await this.init();
    const pixels = imageData.data.buffer.slice(0);
    const response = (await this.send(
      {
        type: "analyzeFrame",
        id: "",
        pixels,
        width: imageData.width,
        height: imageData.height,
      },
      [pixels],
    )) as AnalyzeFrameResponse;

    return {
      corners: response.corners,
      quality: response.quality,
    };
  }

  async perspectiveTransform(
    imageData: ImageData,
    corners: DetectedCorners,
    outWidth: number,
    outHeight: number,
  ): Promise<{ pixels: ArrayBuffer; width: number; height: number }> {
    await this.init();
    const pixels = imageData.data.buffer.slice(0);
    const response = (await this.send(
      {
        type: "perspectiveTransform",
        id: "",
        pixels,
        width: imageData.width,
        height: imageData.height,
        corners,
        outWidth,
        outHeight,
      },
      [pixels],
    )) as PerspectiveTransformResponse;

    return {
      pixels: response.pixels,
      width: response.width,
      height: response.height,
    };
  }

  private send(
    request: WorkerRequest,
    transfer: Transferable[],
    timeoutMs = 30_000,
  ): Promise<unknown> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        reject(new Error("Worker not initialized"));
        return;
      }

      const id = crypto.randomUUID();
      request.id = id;

      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error("Worker request timed out"));
      }, timeoutMs);

      this.pending.set(id, {
        resolve: (value) => {
          clearTimeout(timer);
          resolve(value);
        },
        reject: (reason) => {
          clearTimeout(timer);
          reject(reason);
        },
      });

      this.worker.postMessage(request, transfer);
    });
  }

  dispose() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.readyPromise = null;
    for (const entry of this.pending.values()) {
      entry.reject(new Error("Worker disposed"));
    }
    this.pending.clear();
  }
}

export const opencvWorkerBridge = new OpenCVWorkerBridge();
