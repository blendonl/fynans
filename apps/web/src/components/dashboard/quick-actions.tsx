"use client";

import Link from "next/link";
import { Plus, ArrowLeftRight, User } from "lucide-react";
import { GlassCard } from "@/components/glass/glass-card";

const ACTIONS = [
  { href: "/add", label: "Add", icon: Plus, iconBg: "bg-income/10", iconColor: "text-income" },
  {
    href: "/transactions",
    label: "History",
    icon: ArrowLeftRight,
    iconBg: "bg-info/10",
    iconColor: "text-info",
  },
  {
    href: "/profile",
    label: "Profile",
    icon: User,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {ACTIONS.map((action) => (
        <Link key={action.href} href={action.href}>
          <GlassCard className="flex flex-col items-center gap-2.5 p-4 sm:p-5 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_var(--glass-shadow),0_16px_48px_var(--glass-shadow-strong)] transition-all duration-300 cursor-pointer">
            <div
              className={`h-10 w-10 rounded-xl flex items-center justify-center ${action.iconBg}`}
            >
              <action.icon className={`h-5 w-5 ${action.iconColor}`} />
            </div>
            <span className="text-xs font-semibold text-text">{action.label}</span>
          </GlassCard>
        </Link>
      ))}
    </div>
  );
}
