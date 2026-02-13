import { subDays, subMonths, differenceInDays, startOfDay, endOfDay } from "date-fns";

export type DatePresetKey = "7d" | "30d" | "6m" | "custom";

export interface DateRange {
  dateFrom: Date;
  dateTo: Date;
}

export function getPresetRange(preset: DatePresetKey): DateRange | null {
  const now = new Date();
  switch (preset) {
    case "7d":
      return { dateFrom: startOfDay(subDays(now, 7)), dateTo: endOfDay(now) };
    case "30d":
      return { dateFrom: startOfDay(subDays(now, 30)), dateTo: endOfDay(now) };
    case "6m":
      return { dateFrom: startOfDay(subMonths(now, 6)), dateTo: endOfDay(now) };
    case "custom":
      return null;
  }
}

export function calculatePreviousPeriod(dateFrom: Date, dateTo: Date): DateRange {
  const days = differenceInDays(dateTo, dateFrom);
  return {
    dateFrom: subDays(dateFrom, days),
    dateTo: subDays(dateTo, days),
  };
}

export function formatDateForAPI(date: Date): string {
  return date.toISOString();
}

export function getChartGranularity(dateFrom: Date, dateTo: Date): "day" | "week" | "month" {
  const days = differenceInDays(dateTo, dateFrom);
  if (days <= 30) return "day";
  if (days <= 180) return "week";
  return "month";
}

export const DATE_PRESET_LABELS: Record<Exclude<DatePresetKey, "custom">, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "6m": "Last 6 months",
};
