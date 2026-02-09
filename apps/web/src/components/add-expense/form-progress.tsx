"use client";

import { Check } from "lucide-react";
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
    <div className="flex items-center gap-2 mb-6">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center gap-2">
          <div
            className={cn(
              "h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors",
              step.completed
                ? "bg-primary text-white"
                : step.active
                  ? "bg-primary/20 text-primary border border-primary"
                  : "bg-surface-variant text-text-disabled"
            )}
          >
            {step.completed ? <Check className="h-3.5 w-3.5" /> : i + 1}
          </div>
          <span
            className={cn(
              "text-xs",
              step.completed || step.active ? "text-text" : "text-text-disabled"
            )}
          >
            {step.label}
          </span>
          {i < steps.length - 1 && (
            <div
              className={cn(
                "h-px w-6",
                step.completed ? "bg-primary" : "bg-border"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
