"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { startOfMonth, subDays, subMonths, startOfYear } from "date-fns";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/glass/glass-card";
import type { Category } from "@fynans/shared";

interface AdvancedFilters {
  dateFrom: string;
  dateTo: string;
  minAmount: string;
  maxAmount: string;
  categories: string[];
}

interface TransactionFiltersProps {
  typeFilter: string;
  scopeFilter: string;
  searchQuery: string;
  advancedFilters: AdvancedFilters;
  categories: Category[];
  onTypeChange: (value: string) => void;
  onScopeChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onAdvancedFiltersChange: (filters: AdvancedFilters) => void;
}

export type { AdvancedFilters };

const TYPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "expense", label: "Expenses" },
  { value: "income", label: "Income" },
] as const;

const SCOPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "personal", label: "Personal" },
  { value: "family", label: "Family" },
] as const;

function formatDate(d: Date) {
  return d.toISOString().split("T")[0];
}

const DATE_PRESETS = [
  { label: "This month", getRange: () => ({ from: formatDate(startOfMonth(new Date())), to: "" }) },
  { label: "Last 30 days", getRange: () => ({ from: formatDate(subDays(new Date(), 30)), to: "" }) },
  { label: "Last 3 months", getRange: () => ({ from: formatDate(subMonths(new Date(), 3)), to: "" }) },
  { label: "This year", getRange: () => ({ from: formatDate(startOfYear(new Date())), to: "" }) },
] as const;

interface PillGroupProps {
  options: readonly { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

function PillGroup({ options, value, onChange }: PillGroupProps) {
  return (
    <div className="flex items-center gap-1.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
            value === opt.value
              ? "bg-primary text-white"
              : "bg-surface-variant/60 text-text-secondary hover:text-text hover:bg-surface-variant"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function TransactionFilters({
  typeFilter,
  scopeFilter,
  searchQuery,
  advancedFilters,
  categories,
  onTypeChange,
  onScopeChange,
  onSearchChange,
  onAdvancedFiltersChange,
}: TransactionFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const activeFilterCount = useMemo(() => {
    return [
      advancedFilters.dateFrom,
      advancedFilters.dateTo,
      advancedFilters.minAmount,
      advancedFilters.maxAmount,
      advancedFilters.categories.length > 0 ? "yes" : "",
    ].filter(Boolean).length;
  }, [advancedFilters]);

  const activePreset = useMemo(() => {
    return DATE_PRESETS.findIndex((p) => {
      const range = p.getRange();
      return range.from === advancedFilters.dateFrom && range.to === advancedFilters.dateTo;
    });
  }, [advancedFilters.dateFrom, advancedFilters.dateTo]);

  const clearAll = () => {
    onAdvancedFiltersChange({
      dateFrom: "",
      dateTo: "",
      minAmount: "",
      maxAmount: "",
      categories: [],
    });
  };

  const toggleCategory = (id: string) => {
    const current = advancedFilters.categories;
    const next = current.includes(id)
      ? current.filter((c) => c !== id)
      : [...current, id];
    onAdvancedFiltersChange({ ...advancedFilters, categories: next });
  };

  const applyPreset = (index: number) => {
    if (index === activePreset) {
      onAdvancedFiltersChange({ ...advancedFilters, dateFrom: "", dateTo: "" });
      return;
    }
    const range = DATE_PRESETS[index].getRange();
    onAdvancedFiltersChange({ ...advancedFilters, dateFrom: range.from, dateTo: range.to });
  };

  return (
    <GlassCard className="p-4">
      <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-disabled" />
        <Input
          placeholder="Search by category, store, or description..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-surface/50 border-border-light"
        />
      </div>

      <div className="flex items-center gap-3 overflow-x-auto scrollbar-none pb-0.5">
        <PillGroup options={TYPE_OPTIONS} value={typeFilter} onChange={onTypeChange} />
        <div className="w-px h-5 bg-border-light flex-shrink-0" />
        <PillGroup options={SCOPE_OPTIONS} value={scopeFilter} onChange={onScopeChange} />
        <div className="w-px h-5 bg-border-light flex-shrink-0" />
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
            showAdvanced || activeFilterCount > 0
              ? "bg-primary/10 text-primary"
              : "bg-surface-variant/60 text-text-secondary hover:text-text hover:bg-surface-variant"
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          More
          {activeFilterCount > 0 && (
            <span className="h-4 min-w-4 px-1 rounded-full bg-primary text-white text-[10px] flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <div className="filter-expand" data-open={showAdvanced}>
        <div>
          <div className="space-y-3 pt-3 border-t border-border-light">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
              {DATE_PRESETS.map((preset, i) => (
                <button
                  key={preset.label}
                  onClick={() => applyPreset(i)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                    activePreset === i
                      ? "bg-primary text-white"
                      : "bg-surface-variant/60 text-text-secondary hover:text-text hover:bg-surface-variant"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
              <button
                onClick={() => {}}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                  activePreset === -1 && (advancedFilters.dateFrom || advancedFilters.dateTo)
                    ? "bg-primary text-white"
                    : "bg-surface-variant/60 text-text-secondary hover:text-text hover:bg-surface-variant"
                }`}
              >
                Custom
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-text-secondary uppercase tracking-wide mb-1 block">
                  From
                </label>
                <Input
                  type="date"
                  value={advancedFilters.dateFrom}
                  onChange={(e) =>
                    onAdvancedFiltersChange({ ...advancedFilters, dateFrom: e.target.value })
                  }
                  className="bg-surface/50 border-border-light text-sm"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-text-secondary uppercase tracking-wide mb-1 block">
                  To
                </label>
                <Input
                  type="date"
                  value={advancedFilters.dateTo}
                  onChange={(e) =>
                    onAdvancedFiltersChange({ ...advancedFilters, dateTo: e.target.value })
                  }
                  className="bg-surface/50 border-border-light text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-text-secondary uppercase tracking-wide mb-1 block">
                  Min Amount
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={advancedFilters.minAmount}
                  onChange={(e) =>
                    onAdvancedFiltersChange({ ...advancedFilters, minAmount: e.target.value })
                  }
                  className="bg-surface/50 border-border-light text-sm"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-text-secondary uppercase tracking-wide mb-1 block">
                  Max Amount
                </label>
                <Input
                  type="number"
                  placeholder="∞"
                  value={advancedFilters.maxAmount}
                  onChange={(e) =>
                    onAdvancedFiltersChange({ ...advancedFilters, maxAmount: e.target.value })
                  }
                  className="bg-surface/50 border-border-light text-sm"
                />
              </div>
            </div>

            {categories.length > 0 && (
              <div>
                <label className="text-[11px] font-medium text-text-secondary uppercase tracking-wide mb-2 block">
                  Categories
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        advancedFilters.categories.includes(cat.id)
                          ? "bg-primary text-white"
                          : "bg-surface-variant/60 text-text-secondary hover:text-text"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeFilterCount > 0 && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1 text-xs font-medium text-expense hover:text-expense-light transition-colors"
              >
                <X className="h-3 w-3" />
                Clear all filters
              </button>
            )}
          </div>
        </div>
      </div>
      </div>
    </GlassCard>
  );
}
