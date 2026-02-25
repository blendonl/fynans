"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import { GlassCard } from "@/components/glass/glass-card";
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useDashboardFilter } from "@/providers/dashboard-filter-provider";
import { usePaymentMethods } from "@/hooks/use-payment-methods";
import { DATE_PRESET_LABELS, formatDateForAPI, type DatePresetKey } from "@/lib/date-utils";

const PRESETS: { key: Exclude<DatePresetKey, "custom">; label: string }[] = [
  { key: "7d", label: DATE_PRESET_LABELS["7d"] },
  { key: "30d", label: DATE_PRESET_LABELS["30d"] },
  { key: "6m", label: DATE_PRESET_LABELS["6m"] },
];

const SCOPE_OPTIONS = [
  { value: undefined, label: "All" },
  { value: "personal", label: "Personal" },
  { value: "family", label: "Family" },
] as const;

export function DashboardDateFilter() {
  const {
    activePreset, applyPreset, setCustomRange, dateRange,
    paymentMethodId, scope, setPaymentMethodId, setScope,
  } = useDashboardFilter();
  const { paymentMethods } = usePaymentMethods();
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

      {(paymentMethods.length > 0) && (
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none mt-2 pt-2 border-t border-border-light">
          {SCOPE_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              onClick={() => setScope(opt.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                scope === opt.value
                  ? "bg-primary text-white"
                  : "bg-surface-variant/60 text-text-secondary hover:text-text hover:bg-surface-variant"
              }`}
            >
              {opt.label}
            </button>
          ))}

          <div className="w-px h-5 bg-border-light flex-shrink-0" />

          <button
            onClick={() => setPaymentMethodId(undefined)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
              !paymentMethodId
                ? "bg-primary text-white"
                : "bg-surface-variant/60 text-text-secondary hover:text-text hover:bg-surface-variant"
            }`}
          >
            All methods
          </button>
          {paymentMethods.map((pm) => (
            <button
              key={pm.id}
              onClick={() => setPaymentMethodId(paymentMethodId === pm.id ? undefined : pm.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                paymentMethodId === pm.id
                  ? "bg-primary text-white"
                  : "bg-surface-variant/60 text-text-secondary hover:text-text hover:bg-surface-variant"
              }`}
            >
              <span
                className="h-2 w-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: pm.color }}
              />
              {pm.name}
            </button>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
