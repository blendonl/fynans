"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  PlusCircle,
  Bell,
  User,
} from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/add", label: "Add", icon: PlusCircle },
  { href: "/notifications", label: "Alerts", icon: Bell },
  { href: "/profile", label: "Profile", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();
  const { unreadCount } = useNotifications();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-glass-border-outer bg-glass-bg-strong backdrop-blur-lg pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around py-2">
        {NAV_ITEMS.map((item) => {
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
              {item.href === "/notifications" && unreadCount > 0 && (
                <span className="absolute -top-0.5 right-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-semibold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
