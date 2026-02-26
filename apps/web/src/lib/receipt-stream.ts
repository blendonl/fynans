import { getToken } from "@/lib/auth";
import type { ProcessedReceiptResponse } from "@/hooks/use-receipt-scan";

interface JobStreamEvent {
  status: "waiting" | "active" | "completed" | "failed" | "not_found";
  data?: ProcessedReceiptResponse;
  error?: string;
  progress?: number;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export function getStepLabel(progress: number): string {
  if (progress < 6) return "Loading your items...";
  if (progress < 90) return "Analyzing receipt...";
  return "Finishing up...";
}

export async function streamResult(
  jobId: string,
  onProgress: (progress: number, step: string) => void,
  signal: AbortSignal,
): Promise<ProcessedReceiptResponse> {
  const token = getToken();
  const headers: Record<string, string> = { Accept: "text/event-stream" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}/receipts/jobs/${jobId}/stream`, {
    headers,
    signal,
  });

  if (!response.ok) {
    throw new Error(`Stream failed: ${response.status}`);
  }

  if (!response.body) {
    throw new Error("No response body from stream");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;

      const jsonStr = line.slice(6).trim();
      if (!jsonStr) continue;

      let event: JobStreamEvent;
      try {
        event = JSON.parse(jsonStr);
      } catch {
        continue;
      }

      if (event.status === "completed" && event.data) {
        onProgress(100, "Done!");
        return event.data;
      }

      if (event.status === "failed") {
        throw new Error(event.error || "Receipt processing failed");
      }

      if (event.status === "not_found") {
        throw new Error("Receipt job not found");
      }

      if (event.progress !== undefined) {
        onProgress(event.progress, getStepLabel(event.progress));
      }
    }
  }

  throw new Error("Stream ended without result");
}
