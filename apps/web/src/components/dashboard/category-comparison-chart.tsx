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
import type { CategoryData } from "@/types";
import { ChartTooltip, formatYAxisTick } from "./chart-utils";

interface CategoryComparisonChartProps {
  current: CategoryData[];
  previous: CategoryData[];
}

const COMPARISON_LABELS: Record<string, string> = {
  current: "Current period",
  previous: "Previous period",
};

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
              tickFormatter={formatYAxisTick}
            />
            <Tooltip
              content={<ChartTooltip labelFormatter={(key) => COMPARISON_LABELS[key] ?? key} />}
              cursor={false}
              isAnimationActive={false}
              trigger="hover"
            />
            <Legend
              wrapperStyle={{ fontSize: 11 }}
              formatter={(value: string) => COMPARISON_LABELS[value] ?? value}
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
