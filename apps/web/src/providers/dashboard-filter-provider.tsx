"use client";

import { createContext, useContext, useState, useMemo, useCallback } from "react";
import type { ReactNode } from "react";
import { startOfDay, endOfDay } from "date-fns";
import {
  type DatePresetKey,
  type DateRange,
  getPresetRange,
} from "@/lib/date-utils";

interface DashboardFilterState {
  dateRange: DateRange;
  activePreset: DatePresetKey;
  paymentMethodId: string | undefined;
  scope: string | undefined;
  applyPreset: (preset: DatePresetKey) => void;
  setCustomRange: (dateFrom: Date, dateTo: Date) => void;
  setPaymentMethodId: (id: string | undefined) => void;
  setScope: (scope: string | undefined) => void;
}

const DashboardFilterContext = createContext<DashboardFilterState | null>(null);

export function DashboardFilterProvider({ children }: { children: ReactNode }) {
  const [activePreset, setActivePreset] = useState<DatePresetKey>("30d");
  const [dateRange, setDateRange] = useState<DateRange>(
    () => getPresetRange("30d")!,
  );
  const [paymentMethodId, setPaymentMethodId] = useState<string | undefined>(undefined);
  const [scope, setScope] = useState<string | undefined>(undefined);

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
    () => ({
      dateRange, activePreset,
      paymentMethodId, scope,
      applyPreset, setCustomRange,
      setPaymentMethodId, setScope,
    }),
    [dateRange, activePreset, paymentMethodId, scope, applyPreset, setCustomRange],
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
