"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Plus,
  ShoppingCart,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useUnreadCount } from "@/hooks/use-unread-count";
import { usePendingInvitations } from "@/hooks/use-families";
import { usePendingTransactionCount } from "@/hooks/use-pending-transactions";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/transactions", label: "Txns", icon: ArrowLeftRight },
  { href: "/basket", label: "Basket", icon: ShoppingCart },
];

export function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { unreadCount } = useUnreadCount();
  const { pendingInvitations } = usePendingInvitations();
  const { data: pendingCount } = usePendingTransactionCount();

  const profileBadgeCount = unreadCount + pendingInvitations.length;
  const isAddActive = pathname.startsWith("/add");
  const isProfileActive = pathname.startsWith("/profile");

  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`;

  return (
    <nav aria-label="Main navigation" className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-glass-border-outer bg-glass-bg-strong backdrop-blur-lg pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around py-2">
        {NAV_ITEMS.slice(0, 2).map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-1 px-3 py-1 text-xs active:scale-95 transition-transform",
                isActive ? "text-primary" : "text-text-secondary"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.href === "/transactions" && (pendingCount ?? 0) > 0 && (
                <span className="absolute -top-0.5 right-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-warning px-1 text-[10px] font-semibold text-white">
                  {pendingCount! > 9 ? "9+" : pendingCount}
                </span>
              )}
              {item.label}
            </Link>
          );
        })}

        <Link
          href="/add"
          aria-label="Add transaction"
          className={cn(
            "relative -mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-variant shadow-lg fab-enter active:scale-90 transition-transform",
            isAddActive && "fab-glow"
          )}
        >
          <Plus className="h-7 w-7 text-white" strokeWidth={2.5} />
        </Link>

        {NAV_ITEMS.slice(2).map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-1 px-3 py-1 text-xs active:scale-95 transition-transform",
                isActive ? "text-primary" : "text-text-secondary"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}

        <Link
          href="/profile"
          className={cn(
            "relative flex flex-col items-center gap-1 px-3 py-1 text-xs active:scale-95 transition-transform",
            isProfileActive ? "text-primary" : "text-text-secondary"
          )}
        >
          <div
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold leading-none",
              isProfileActive
                ? "bg-primary text-white"
                : "bg-surface-variant text-text-secondary"
            )}
          >
            {initials}
          </div>
          {profileBadgeCount > 0 && (
            <span className="absolute -top-0.5 right-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-semibold text-white">
              {profileBadgeCount > 9 ? "9+" : profileBadgeCount}
            </span>
          )}
          Profile
        </Link>
      </div>
    </nav>
  );
}
