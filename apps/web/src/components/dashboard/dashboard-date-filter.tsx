"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import { GlassCard } from "@/components/glass/glass-card";
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useDashboardFilter } from "@/contexts/dashboard-filter-context";
import { DATE_PRESET_LABELS, formatDateForAPI, type DatePresetKey } from "@/lib/date-utils";

const PRESETS: { key: Exclude<DatePresetKey, "custom">; label: string }[] = [
  { key: "7d", label: DATE_PRESET_LABELS["7d"] },
  { key: "30d", label: DATE_PRESET_LABELS["30d"] },
  { key: "6m", label: DATE_PRESET_LABELS["6m"] },
];

export function DashboardDateFilter() {
  const { activePreset, applyPreset, setCustomRange, dateRange } = useDashboardFilter();
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [open, setOpen] = useState(false);

  const handleApplyCustom = () => {
    if (customFrom && customTo) {
      setCustomRange(new Date(customFrom), new Date(customTo));
      setOpen(false);
    }
  };

  return (
    <GlassCard className="p-3">
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {PRESETS.map((preset) => (
          <button
            key={preset.key}
            onClick={() => applyPreset(preset.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
              activePreset === preset.key
                ? "bg-primary text-white"
                : "bg-surface-variant/60 text-text-secondary hover:text-text hover:bg-surface-variant"
            }`}
          >
            {preset.label}
          </button>
        ))}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                activePreset === "custom"
                  ? "bg-primary text-white"
                  : "bg-surface-variant/60 text-text-secondary hover:text-text hover:bg-surface-variant"
              }`}
            >
              <Calendar className="h-3 w-3" />
              {activePreset === "custom"
                ? `${formatDateForAPI(dateRange.dateFrom)} — ${formatDateForAPI(dateRange.dateTo)}`
                : "Custom"}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64 space-y-3">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
              Custom range
            </p>
            <div className="space-y-2">
              <div>
                <label className="text-[11px] font-medium text-text-secondary uppercase tracking-wide mb-1 block">
                  From
                </label>
                <Input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="bg-surface/50 border-border-light text-sm"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-text-secondary uppercase tracking-wide mb-1 block">
                  To
                </label>
                <Input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="bg-surface/50 border-border-light text-sm"
                />
              </div>
            </div>
            <button
              onClick={handleApplyCustom}
              disabled={!customFrom || !customTo}
              className="w-full px-3 py-1.5 rounded-full text-xs font-medium bg-primary text-white disabled:opacity-40 transition-opacity"
            >
              Apply
            </button>
          </PopoverContent>
        </Popover>
      </div>
    </GlassCard>
  );
}
