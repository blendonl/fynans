import { formatCurrency } from "@/utils/currency";

interface ChartTooltipEntry {
  value: number;
  dataKey: string;
  color: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: ChartTooltipEntry[];
  label?: string;
  labelFormatter?: (dataKey: string) => string;
}

export function ChartTooltip({ active, payload, label, labelFormatter }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-glass-border-outer bg-glass-bg-strong backdrop-blur-lg p-3 shadow-md space-y-1 animate-in fade-in duration-100">
      <p className="text-[11px] font-medium text-text-secondary">{label}</p>
      {payload.map((e) => (
        <p key={e.dataKey} className="text-xs font-mono" style={{ color: e.color }}>
          {labelFormatter ? labelFormatter(e.dataKey) : e.dataKey}: {formatCurrency(e.value)}
        </p>
      ))}
    </div>
  );
}

export function formatYAxisTick(v: number): string {
  return v >= 1000
    ? `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}K`
    : formatCurrency(v);
}

interface CrosshairCursorProps {
  points?: { x: number; y: number }[];
  height?: number;
}

export function CrosshairCursor({ points, height }: CrosshairCursorProps) {
  if (!points?.length) return null;
  const { x, y } = points[0];
  return (
    <g>
      <line
        x1={x}
        y1={y}
        x2={x}
        y2={height}
        stroke="var(--expense)"
        strokeOpacity={0.3}
        strokeDasharray="3 3"
        strokeWidth={1}
      />
    </g>
  );
}
