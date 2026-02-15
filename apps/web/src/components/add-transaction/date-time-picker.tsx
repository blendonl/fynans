"use client";

import { useMemo } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
}

function formatFriendly(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Select date & time";

  const time = format(date, "h:mm a");
  if (isToday(date)) return `Today, ${time}`;
  if (isYesterday(date)) return `Yesterday, ${time}`;
  return format(date, "MMM d, yyyy") + `, ${time}`;
}

function localNow() {
  return format(new Date(), "yyyy-MM-dd'T'HH:mm");
}

function localYesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return format(d, "yyyy-MM-dd'T'HH:mm");
}

export function DateTimePicker({ value, onChange }: DateTimePickerProps) {
  const friendly = useMemo(() => formatFriendly(value), [value]);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange(localNow())}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-xl transition-colors cursor-pointer",
            isToday(new Date(value))
              ? "bg-primary/10 text-primary ring-1 ring-primary/20"
              : "bg-surface-variant text-text-secondary hover:text-text"
          )}
        >
          Now
        </button>
        <button
          type="button"
          onClick={() => onChange(localYesterday())}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-xl transition-colors cursor-pointer",
            isYesterday(new Date(value))
              ? "bg-primary/10 text-primary ring-1 ring-primary/20"
              : "bg-surface-variant text-text-secondary hover:text-text"
          )}
        >
          Yesterday
        </button>
      </div>
      <label className="relative flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 cursor-pointer hover:border-primary/40 transition-colors">
        <Calendar className="h-4 w-4 text-text-secondary shrink-0" />
        <span className="text-sm text-text">{friendly}</span>
        <input
          type="datetime-local"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </label>
    </div>
  );
}
