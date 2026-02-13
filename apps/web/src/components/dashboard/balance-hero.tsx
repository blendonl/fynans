"use client";

import { GlassCard } from "@/components/glass/glass-card";
import { formatCurrency } from "@fynans/shared";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import type { ComparisonData } from "@/hooks/use-dashboard-data";

interface BalanceHeroProps {
  net: number;
  totalIncome: number;
  totalExpenses: number;
  count: number;
  comparison?: ComparisonData | null;
}

function ComparisonBadge({
  delta,
  percentage,
  favorable,
}: {
  delta: number;
  percentage: number;
  favorable: "positive" | "negative";
}) {
  if (delta === 0 && percentage === 0) return null;
  const isGood = favorable === "positive" ? delta >= 0 : delta <= 0;
  const color = isGood ? "text-income" : "text-expense";
  const Icon = delta >= 0 ? TrendingUp : TrendingDown;
  const sign = delta >= 0 ? "+" : "";

  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-medium ${color}`}>
      <Icon className="h-2.5 w-2.5" />
      {sign}{formatCurrency(delta)} ({sign}{percentage}%)
    </span>
  );
}

function StatPill({
  icon,
  label,
  value,
  colorClass,
  comparisonBadge,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  colorClass: string;
  comparisonBadge?: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl ${colorClass}`}>
      {icon}
      <span className="text-[10px] font-medium text-text-secondary tracking-wider uppercase">
        {label}
      </span>
      <span className="text-sm font-bold font-mono">{value}</span>
      {comparisonBadge}
    </div>
  );
}

export function BalanceHero({
  net,
  totalIncome,
  totalExpenses,
  count,
  comparison,
}: BalanceHeroProps) {
  return (
    <GlassCard variant="strong" className="p-8 sm:p-10">
      <div className="flex flex-col items-center text-center gap-5">
        <p className="text-[11px] font-semibold text-text-secondary tracking-[0.2em] uppercase">
          Net Balance
        </p>

        <div>
          <p
            className={`text-[2.75rem] sm:text-[3.5rem] font-bold font-mono tracking-tighter leading-none ${
              net >= 0 ? "text-income" : "text-expense"
            }`}
          >
            {formatCurrency(net)}
          </p>
          {comparison && (
            <div className="mt-2 flex justify-center">
              <ComparisonBadge
                delta={comparison.net.delta}
                percentage={comparison.net.percentage}
                favorable="positive"
              />
            </div>
          )}
          <div className="mt-4 mx-auto h-px w-20 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-md pt-2">
          <StatPill
            icon={<TrendingUp className="h-3.5 w-3.5" />}
            label="Income"
            value={formatCurrency(totalIncome)}
            colorClass="text-income bg-income/[0.07]"
            comparisonBadge={
              comparison && (
                <ComparisonBadge
                  delta={comparison.income.delta}
                  percentage={comparison.income.percentage}
                  favorable="positive"
                />
              )
            }
          />
          <StatPill
            icon={<TrendingDown className="h-3.5 w-3.5" />}
            label="Spent"
            value={formatCurrency(totalExpenses)}
            colorClass="text-expense bg-expense/[0.07]"
            comparisonBadge={
              comparison && (
                <ComparisonBadge
                  delta={comparison.expenses.delta}
                  percentage={comparison.expenses.percentage}
                  favorable="negative"
                />
              )
            }
          />
          <StatPill
            icon={<Activity className="h-3.5 w-3.5" />}
            label="Total"
            value={String(count)}
            colorClass="text-primary bg-primary/[0.07]"
          />
        </div>
      </div>
    </GlassCard>
  );
}
