"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useUnreadCount } from "@/hooks/use-unread-count";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function DashboardHeader() {
  const { user } = useAuth();
  const { unreadCount } = useUnreadCount();

  return (
    <div className="dash-animate-in flex items-start justify-between">
      <div>
        <p className="text-[11px] font-semibold text-text-secondary tracking-[0.2em] uppercase">
          {getGreeting()}
        </p>
        <h1 className="text-xl sm:text-2xl font-bold text-text mt-1">
          {user?.firstName}
        </h1>
      </div>
      <Link
        href="/notifications"
        className="relative rounded-xl p-2 hover:bg-surface-variant transition-colors"
      >
        <Bell className="h-5 w-5 text-text-secondary" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Link>
    </div>
  );
}
