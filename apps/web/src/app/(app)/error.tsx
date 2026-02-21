"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center px-4">
      <AlertTriangle className="h-12 w-12 text-expense" />
      <h2 className="text-xl font-semibold text-text-primary">Something went wrong</h2>
      <p className="text-sm text-text-secondary max-w-md">
        An unexpected error occurred. Please try again or refresh the page.
      </p>
      <Button onClick={reset} variant="outline">
        Try again
      </Button>
    </div>
  );
}
