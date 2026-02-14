"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { GlassCard } from "@/components/glass/glass-card";
import { formatCurrency } from "@fynans/shared";
import type { ExpenseTrendPoint } from "@/hooks/use-dashboard-data";

interface ExpenseTrendChartProps {
  data: ExpenseTrendPoint[];
}

function CrosshairCursor({ points, width, height }: Record<string, unknown>) {
  if (!points || !(points as { x: number; y: number }[]).length) return null;
  const { x, y } = (points as { x: number; y: number }[])[0];
  return (
    <g>
      <line
        x1={x}
        y1={y}
        x2={x}
        y2={height as number}
        stroke="var(--expense)"
        strokeOpacity={0.3}
        strokeDasharray="3 3"
        strokeWidth={1}
      />
    </g>
  );
}

function CustomTooltip({ active, payload, label }: Record<string, unknown>) {
  if (!active || !payload || !(payload as unknown[]).length) return null;
  const entry = (payload as { value: number }[])[0];
  return (
    <div className="rounded-xl border border-glass-border-outer bg-glass-bg-strong backdrop-blur-lg p-3 shadow-md animate-in fade-in duration-100">
      <p className="text-[11px] font-medium text-text-secondary">{label as string}</p>
      <p className="text-sm font-bold font-mono text-expense">
        {formatCurrency(entry.value)}
      </p>
    </div>
  );
}

export function ExpenseTrendChart({ data }: ExpenseTrendChartProps) {
  return (
    <GlassCard className="p-5">
      <h3 className="text-xs font-semibold text-text-secondary tracking-[0.15em] uppercase mb-4">
        Spending Trend
      </h3>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-sm text-text-disabled">
          No data for this period
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 4, right: 24, left: 0, bottom: 8 }}>
            <defs>
              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--expense)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="var(--expense)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border-light)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              interval={Math.max(0, Math.ceil(data.length / 7) - 1)}
              tick={{ fontSize: 10, fill: "var(--text-secondary)", dy: 6 }}
              tickFormatter={(v: string) => {
                const d = new Date(v);
                return isNaN(d.getTime()) ? v : `${d.toLocaleString("default", { month: "short" })} ${d.getDate()}`;
              }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "var(--text-secondary)" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) =>
                v >= 1000 ? `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}K` : formatCurrency(v)
              }
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={<CrosshairCursor />}
              isAnimationActive={false}
              trigger="hover"
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="var(--expense)"
              strokeWidth={2}
              fill="url(#expenseGrad)"
              dot={{ r: 3, fill: "var(--expense)", strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "var(--expense)", strokeWidth: 2, stroke: "rgba(255,255,255,0.3)" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </GlassCard>
  );
}
