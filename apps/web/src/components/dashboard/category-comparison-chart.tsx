"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { GlassCard } from "@/components/glass/glass-card";
import { formatCurrency } from "@fynans/shared";

interface CategoryData {
  categoryId: string;
  categoryName: string;
  total: number;
}

interface CategoryComparisonChartProps {
  current: CategoryData[];
  previous: CategoryData[];
}

function CustomTooltip({ active, payload, label }: Record<string, unknown>) {
  if (!active || !payload || !(payload as unknown[]).length) return null;
  const entries = payload as { value: number; dataKey: string; color: string }[];
  return (
    <div className="rounded-xl border border-glass-border-outer bg-glass-bg-strong backdrop-blur-lg p-3 shadow-md space-y-1 animate-in fade-in duration-100">
      <p className="text-[11px] font-medium text-text-secondary">{label as string}</p>
      {entries.map((e) => (
        <p key={e.dataKey} className="text-xs font-mono" style={{ color: e.color }}>
          {e.dataKey === "current" ? "Current" : "Previous"}: {formatCurrency(e.value)}
        </p>
      ))}
    </div>
  );
}

export function CategoryComparisonChart({
  current,
  previous,
}: CategoryComparisonChartProps) {
  const chartData = useMemo(() => {
    const top5 = [...current].sort((a, b) => b.total - a.total).slice(0, 5);
    const prevMap = new Map(previous.map((p) => [p.categoryId, p.total]));

    return top5.map((cat) => ({
      name: cat.categoryName,
      current: cat.total,
      previous: prevMap.get(cat.categoryId) ?? 0,
    }));
  }, [current, previous]);

  return (
    <GlassCard className="p-5">
      <h3 className="text-xs font-semibold text-text-secondary tracking-[0.15em] uppercase mb-4">
        Category Comparison
      </h3>
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-sm text-text-disabled">
          No data for this period
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border-light)"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: "var(--text-secondary)" }}
              tickLine={false}
              axisLine={false}
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
              cursor={false}
              isAnimationActive={false}
              trigger="item"
            />
            <Legend
              wrapperStyle={{ fontSize: 11 }}
              formatter={(value: string) =>
                value === "current" ? "Current period" : "Previous period"
              }
            />
            <Bar dataKey="current" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            <Bar
              dataKey="previous"
              fill="var(--text-disabled)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </GlassCard>
  );
}
