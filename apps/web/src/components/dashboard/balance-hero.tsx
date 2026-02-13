"use client";

import { GlassCard } from "@/components/glass/glass-card";
import { formatCurrency } from "@fynans/shared";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

interface BalanceHeroProps {
  net: number;
  totalIncome: number;
  totalExpenses: number;
  count: number;
}

function StatPill({
  icon,
  label,
  value,
  colorClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  colorClass: string;
}) {
  return (
    <div className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl ${colorClass}`}>
      {icon}
      <span className="text-[10px] font-medium text-text-secondary tracking-wider uppercase">
        {label}
      </span>
      <span className="text-sm font-bold font-mono">{value}</span>
    </div>
  );
}

export function BalanceHero({ net, totalIncome, totalExpenses, count }: BalanceHeroProps) {
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
          <div className="mt-4 mx-auto h-px w-20 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-md pt-2">
          <StatPill
            icon={<TrendingUp className="h-3.5 w-3.5" />}
            label="Income"
            value={formatCurrency(totalIncome)}
            colorClass="text-income bg-income/[0.07]"
          />
          <StatPill
            icon={<TrendingDown className="h-3.5 w-3.5" />}
            label="Spent"
            value={formatCurrency(totalExpenses)}
            colorClass="text-expense bg-expense/[0.07]"
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
