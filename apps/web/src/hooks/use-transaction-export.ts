import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { getTransactionControllerExportUrl } from "@/api/generated/endpoints/transaction/transaction";
import { API_BASE_URL } from "@/lib/env";

const FILENAME_FROM_DISPOSITION = /filename="([^"]+)"/;

function fileNameFrom(headers: Headers): string {
  const disposition = headers.get("content-disposition") ?? "";
  const match = FILENAME_FROM_DISPOSITION.exec(disposition);

  return match?.[1] ?? "fynans-transactions.csv";
}

function saveBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function useTransactionExport() {
  const download = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `${API_BASE_URL}${getTransactionControllerExportUrl({ format: "csv" })}`,
        { credentials: "include" },
      );

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "Your session expired. Sign in again to export."
            : "Your transactions could not be exported.",
        );
      }

      saveBlob(await response.blob(), fileNameFrom(response.headers));
    },
    onSuccess: () => {
      toast.success("Your transactions were downloaded as CSV.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to export transactions");
    },
  });

  return { download };
}
