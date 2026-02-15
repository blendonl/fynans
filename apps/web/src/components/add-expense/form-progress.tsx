"use client";

import { cn } from "@/lib/utils";

interface Step {
  label: string;
  completed: boolean;
  active: boolean;
}

interface FormProgressProps {
  steps: Step[];
}

export function FormProgress({ steps }: FormProgressProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-4">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center gap-2" title={step.label}>
          <div
            className={cn(
              "h-2 w-2 rounded-full transition-all duration-300",
              step.completed
                ? "bg-primary scale-100"
                : step.active
                  ? "bg-primary animate-pulse scale-110"
                  : "bg-border"
            )}
          />
          {i < steps.length - 1 && (
            <div
              className={cn(
                "h-px w-6 transition-colors duration-300",
                step.completed ? "bg-primary" : "bg-border"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
