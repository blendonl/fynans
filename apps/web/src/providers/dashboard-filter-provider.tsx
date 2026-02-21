"use client";

import { createContext, useContext, useState, useMemo, useCallback } from "react";
import type { ReactNode } from "react";
import { startOfDay, endOfDay } from "date-fns";
import {
  type DatePresetKey,
  type DateRange,
  getPresetRange,
  calculatePreviousPeriod,
} from "@/lib/date-utils";

interface DashboardFilterState {
  dateRange: DateRange;
  previousRange: DateRange;
  activePreset: DatePresetKey;
  applyPreset: (preset: DatePresetKey) => void;
  setCustomRange: (dateFrom: Date, dateTo: Date) => void;
}

const DashboardFilterContext = createContext<DashboardFilterState | null>(null);

export function DashboardFilterProvider({ children }: { children: ReactNode }) {
  const [activePreset, setActivePreset] = useState<DatePresetKey>("30d");
  const [dateRange, setDateRange] = useState<DateRange>(
    () => getPresetRange("30d")!,
  );

  const previousRange = useMemo(
    () => calculatePreviousPeriod(dateRange.dateFrom, dateRange.dateTo),
    [dateRange],
  );

  const applyPreset = useCallback((preset: DatePresetKey) => {
    if (preset === "custom") {
      setActivePreset("custom");
      return;
    }
    const range = getPresetRange(preset);
    if (range) {
      setDateRange(range);
      setActivePreset(preset);
    }
  }, []);

  const setCustomRange = useCallback((dateFrom: Date, dateTo: Date) => {
    setDateRange({ dateFrom: startOfDay(dateFrom), dateTo: endOfDay(dateTo) });
    setActivePreset("custom");
  }, []);

  const value = useMemo(
    () => ({ dateRange, previousRange, activePreset, applyPreset, setCustomRange }),
    [dateRange, previousRange, activePreset, applyPreset, setCustomRange],
  );

  return (
    <DashboardFilterContext.Provider value={value}>
      {children}
    </DashboardFilterContext.Provider>
  );
}

export function useDashboardFilter() {
  const ctx = useContext(DashboardFilterContext);
  if (!ctx) throw new Error("useDashboardFilter must be used within DashboardFilterProvider");
  return ctx;
}
