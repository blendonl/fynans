"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  secondary?: React.ReactNode;
  className?: string;
  compact?: boolean;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  secondary,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center text-center px-6",
        compact ? "py-8" : "py-16",
        className
      )}
    >
      <div
        className={cn(
          "relative flex items-center justify-center mb-4",
          compact ? "h-12 w-12" : "h-20 w-20"
        )}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10" />
        <Icon
          className={cn(
            "relative text-text-disabled",
            compact ? "h-6 w-6" : "h-10 w-10"
          )}
        />
      </div>

      <p
        className={cn(
          "font-medium text-text-secondary",
          compact ? "text-sm" : "text-base"
        )}
      >
        {title}
      </p>

      {description && (
        <p className="text-sm text-text-disabled mt-1 max-w-sm">{description}</p>
      )}

      {actionLabel && (actionHref || onAction) && (
        <div className="mt-5">
          {actionHref ? (
            <Button asChild size={compact ? "sm" : "default"}>
              <Link href={actionHref}>{actionLabel}</Link>
            </Button>
          ) : (
            <Button size={compact ? "sm" : "default"} onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      )}

      {secondary && <div className="mt-3">{secondary}</div>}
    </div>
  );
}
