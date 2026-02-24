"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  format,
  isToday,
  isYesterday,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  setHours,
  setMinutes,
  getHours,
  getMinutes,
} from "date-fns";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Clock,
} from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types & helpers                                                    */
/* ------------------------------------------------------------------ */

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

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

function toLocalString(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

function to12Hour(h24: number) {
  return { hour12: h24 % 12 || 12, isPM: h24 >= 12 };
}

function to24Hour(hour12: number, isPM: boolean) {
  if (hour12 === 12) return isPM ? 12 : 0;
  return isPM ? hour12 + 12 : hour12;
}

/* ------------------------------------------------------------------ */
/*  TimeSpinner                                                        */
/* ------------------------------------------------------------------ */

interface SpinnerProps {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  pad?: number;
}

function TimeSpinner({ value, onChange, min, max, pad = 2 }: SpinnerProps) {
  const inc = () => onChange(value >= max ? min : value + 1);
  const dec = () => onChange(value <= min ? max : value - 1);

  return (
    <div className="flex flex-col items-center select-none">
      <button
        type="button"
        onClick={inc}
        className="p-0.5 rounded-md hover:bg-surface-variant active:scale-90 transition-all cursor-pointer text-text-secondary hover:text-text"
      >
        <ChevronUp className="h-3.5 w-3.5" />
      </button>
      <span className="text-base font-semibold text-text tabular-nums w-7 text-center leading-none py-0.5">
        {value.toString().padStart(pad, "0")}
      </span>
      <button
        type="button"
        onClick={dec}
        className="p-0.5 rounded-md hover:bg-surface-variant active:scale-90 transition-all cursor-pointer text-text-secondary hover:text-text"
      >
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  DateTimePicker                                                     */
/* ------------------------------------------------------------------ */

export function DateTimePicker({ value, onChange }: DateTimePickerProps) {
  const [open, setOpen] = useState(false);

  const selectedDate = useMemo(() => {
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date() : d;
  }, [value]);

  const [viewMonth, setViewMonth] = useState(() =>
    startOfMonth(selectedDate),
  );

  // Reset viewMonth to selected date's month whenever the popover opens
  useEffect(() => {
    if (open) setViewMonth(startOfMonth(selectedDate));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const friendly = useMemo(() => formatFriendly(value), [value]);

  /* ---------- Calendar grid ---------- */

  const calendarDays = useMemo(() => {
    const mStart = startOfMonth(viewMonth);
    const mEnd = endOfMonth(viewMonth);
    return eachDayOfInterval({
      start: startOfWeek(mStart),
      end: endOfWeek(mEnd),
    });
  }, [viewMonth]);

  /* ---------- Time values ---------- */

  const h24 = getHours(selectedDate);
  const mins = getMinutes(selectedDate);
  const { hour12, isPM } = to12Hour(h24);

  /* ---------- Handlers ---------- */

  const commit = useCallback(
    (d: Date) => onChange(toLocalString(d)),
    [onChange],
  );

  const handleDayClick = useCallback(
    (day: Date) => {
      let d = new Date(day);
      d = setHours(d, h24);
      d = setMinutes(d, mins);
      commit(d);
    },
    [h24, mins, commit],
  );

  const handleHourChange = useCallback(
    (newH12: number) => {
      commit(setHours(new Date(selectedDate), to24Hour(newH12, isPM)));
    },
    [selectedDate, isPM, commit],
  );

  const handleMinuteChange = useCallback(
    (newMin: number) => {
      commit(setMinutes(new Date(selectedDate), newMin));
    },
    [selectedDate, commit],
  );

  const toggleAmPm = useCallback(() => {
    commit(setHours(new Date(selectedDate), to24Hour(hour12, !isPM)));
  }, [selectedDate, hour12, isPM, commit]);

  /* ---------- Render ---------- */

  return (
    <div className="space-y-2">
      {/* Quick-select chips */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange(localNow())}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-xl transition-colors cursor-pointer",
            isToday(selectedDate)
              ? "bg-primary/10 text-primary ring-1 ring-primary/20"
              : "bg-surface-variant text-text-secondary hover:text-text",
          )}
        >
          Now
        </button>
        <button
          type="button"
          onClick={() => onChange(localYesterday())}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-xl transition-colors cursor-pointer",
            isYesterday(selectedDate)
              ? "bg-primary/10 text-primary ring-1 ring-primary/20"
              : "bg-surface-variant text-text-secondary hover:text-text",
          )}
        >
          Yesterday
        </button>
      </div>

      {/* Popover trigger */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="w-full flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 cursor-pointer hover:border-primary/40 transition-colors text-left"
          >
            <Calendar className="h-4 w-4 text-text-secondary shrink-0" />
            <span className="text-sm text-text">{friendly}</span>
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={6}
          className="w-[280px] p-0 overflow-hidden"
        >
          {/* ---- Month navigation ---- */}
          <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
            <button
              type="button"
              onClick={() => setViewMonth((m) => subMonths(m, 1))}
              className="p-1 rounded-lg hover:bg-surface-variant transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4 text-text-secondary" />
            </button>
            <span className="text-[13px] font-semibold text-text tracking-wide">
              {format(viewMonth, "MMMM yyyy")}
            </span>
            <button
              type="button"
              onClick={() => setViewMonth((m) => addMonths(m, 1))}
              className="p-1 rounded-lg hover:bg-surface-variant transition-colors cursor-pointer"
            >
              <ChevronRight className="h-4 w-4 text-text-secondary" />
            </button>
          </div>

          {/* ---- Weekday headers ---- */}
          <div className="grid grid-cols-7 px-2.5">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="text-center text-[10px] font-semibold text-text-disabled uppercase tracking-wider py-1"
              >
                {d}
              </div>
            ))}
          </div>

          {/* ---- Day grid ---- */}
          <div className="grid grid-cols-7 px-2.5 pb-2.5 gap-y-0.5">
            {calendarDays.map((day, i) => {
              const selected = isSameDay(day, selectedDate);
              const inMonth = isSameMonth(day, viewMonth);
              const today = isToday(day);

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  className={cn(
                    "h-8 w-8 mx-auto rounded-xl text-[13px] transition-all cursor-pointer flex items-center justify-center",
                    selected
                      ? "bg-primary text-white font-semibold shadow-sm shadow-primary/25"
                      : today
                        ? "ring-1 ring-primary/30 text-primary font-medium hover:bg-primary/8"
                        : inMonth
                          ? "text-text hover:bg-surface-variant"
                          : "text-text-disabled/40 hover:bg-surface-variant/50",
                  )}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>

          {/* ---- Time picker ---- */}
          <div className="border-t border-border px-4 py-2.5 flex items-center gap-3">
            <Clock className="h-3.5 w-3.5 text-text-secondary shrink-0" />

            <div className="flex items-center gap-1">
              <TimeSpinner
                value={hour12}
                onChange={handleHourChange}
                min={1}
                max={12}
              />
              <span className="text-text-secondary font-bold text-sm pb-px select-none">
                :
              </span>
              <TimeSpinner
                value={mins}
                onChange={handleMinuteChange}
                min={0}
                max={59}
              />
            </div>

            <button
              type="button"
              onClick={toggleAmPm}
              className="ml-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-surface-variant text-text-secondary hover:text-text hover:bg-primary/10 active:scale-95 transition-all cursor-pointer"
            >
              {isPM ? "PM" : "AM"}
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
