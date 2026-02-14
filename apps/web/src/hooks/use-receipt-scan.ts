import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface ProcessedReceiptResponse {
  store: { id?: string; name: string; location: string } | null;
  items: { id?: string; name: string; price: number; quantity: number; category?: string }[];
  recordedAt?: string;
  extractedText: string;
  confidence: number;
}

export function useReceiptScan() {
  const mutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return apiClient.post("/receipts/process", formData) as Promise<ProcessedReceiptResponse>;
    },
  });

  return {
    scan: mutation.mutate,
    scanAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    reset: mutation.reset,
  };
}
