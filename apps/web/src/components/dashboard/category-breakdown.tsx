"use client";

import { GlassCard } from "@/components/glass/glass-card";
import { formatCurrency } from "@fynans/shared";

const COLORS = [
  "var(--primary)",
  "var(--secondary)",
  "var(--info)",
  "var(--success)",
  "var(--warning)",
  "var(--expense)",
];

const CHART_SIZE = 160;
const CENTER = CHART_SIZE / 2;
const RADIUS = 58;
const STROKE_WIDTH = 20;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP_DEGREES = 3;

interface CategoryBreakdownProps {
  expensesByCategory: { categoryName: string; total: number; count: number }[];
}

export function CategoryBreakdown({ expensesByCategory }: CategoryBreakdownProps) {
  const categories = expensesByCategory.slice(0, 6);

  const total = categories.reduce((sum, cat) => sum + cat.total, 0);
  const gapPerSegment = categories.length > 1 ? (GAP_DEGREES / 360) * CIRCUMFERENCE : 0;

  let cumulativeOffset = 0;
  const segments = categories.map((cat, i) => {
    const proportion = total > 0 ? cat.total / total : 0;
    const rawLength = proportion * CIRCUMFERENCE;
    const length = Math.max(rawLength - gapPerSegment, 2);
    const offset = cumulativeOffset + gapPerSegment / 2;
    cumulativeOffset += rawLength;
    return {
      name: cat.categoryName,
      value: cat.total,
      color: COLORS[i % COLORS.length],
      length,
      rotation: (offset / CIRCUMFERENCE) * 360 - 90,
    };
  });

  return (
    <GlassCard className="p-6 h-full">
      <h3 className="text-[11px] font-semibold text-text-secondary tracking-[0.2em] uppercase mb-6">
        Spending by Category
      </h3>

      {categories.length === 0 ? (
        <p className="text-sm text-text-disabled py-8 text-center">No expenses yet</p>
      ) : (
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <svg
              width={CHART_SIZE}
              height={CHART_SIZE}
              viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}
              className="overflow-visible"
            >
              <circle
                cx={CENTER}
                cy={CENTER}
                r={RADIUS}
                fill="none"
                stroke="var(--surface-variant)"
                strokeWidth={STROKE_WIDTH}
                opacity={0.5}
              />
              {segments.map((seg, i) => (
                <circle
                  key={seg.name}
                  cx={CENTER}
                  cy={CENTER}
                  r={RADIUS}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={STROKE_WIDTH}
                  strokeDasharray={`${seg.length} ${CIRCUMFERENCE - seg.length}`}
                  strokeLinecap="round"
                  transform={`rotate(${seg.rotation} ${CENTER} ${CENTER})`}
                  className="donut-segment"
                  style={{ animationDelay: `${i * 80 + 300}ms` }}
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[10px] font-medium text-text-disabled tracking-wider uppercase">
                Total
              </span>
              <span className="text-base font-bold font-mono text-text">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-full">
            {segments.map((seg) => (
              <div key={seg.name} className="flex items-center gap-2 min-w-0">
                <span
                  className="h-2 w-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="text-xs text-text-secondary truncate flex-1">{seg.name}</span>
                <span className="text-[11px] font-mono text-text-secondary flex-shrink-0">
                  {formatCurrency(seg.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  );
}
