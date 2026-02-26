import { useContext } from "react";
import { ScanQueueContext } from "@/providers/scan-queue-provider";

export function useScanQueue() {
  const ctx = useContext(ScanQueueContext);
  if (!ctx) {
    throw new Error("useScanQueue must be used within ScanQueueProvider");
  }
  return ctx;
}
