"use client";

import Link from "next/link";
import { Moon, Sun, Monitor, LogOut, Users, ChevronRight, Bell, Settings2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/providers/auth-provider";
import { useFamilies } from "@/hooks/use-families";
import { useUnreadCount } from "@/hooks/use-unread-count";
import { PaymentMethodsSection } from "@/components/profile/payment-methods-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { pendingInvitations } = useFamilies();
  const pendingInvitationCount = pendingInvitations.length;
  const { unreadCount } = useUnreadCount();

  const themes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        label="Account"
        title="Profile"
        description="Manage your account settings and preferences."
      />

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            <div>
              <p className="text-lg font-medium text-text">{user?.firstName} {user?.lastName}</p>
              <p className="text-sm text-text-secondary">{user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {themes.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={cn(
                  "flex flex-1 flex-col items-center gap-2 rounded-lg border p-4 transition-colors cursor-pointer",
                  theme === value
                    ? "border-primary bg-selection-bg"
                    : "border-border hover:bg-surface-variant"
                )}
              >
                <Icon className={cn("h-5 w-5", theme === value ? "text-primary" : "text-text-secondary")} />
                <span className={cn("text-sm", theme === value ? "text-primary font-medium" : "text-text-secondary")}>
                  {label}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Link
            href="/notifications"
            className="flex items-center gap-3 px-6 py-4 hover:bg-surface-variant transition-colors"
          >
            <Bell className="h-5 w-5 text-text-secondary shrink-0" />
            <span className="flex-1 text-sm font-medium text-text">Notifications</span>
            {unreadCount > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-error px-1.5 text-[11px] font-semibold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
            <ChevronRight className="h-4 w-4 text-text-secondary shrink-0" />
          </Link>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Families</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Link
            href="/families"
            className="flex items-center gap-3 px-6 py-4 hover:bg-surface-variant transition-colors"
          >
            <Users className="h-5 w-5 text-text-secondary shrink-0" />
            <span className="flex-1 text-sm font-medium text-text">My Families</span>
            {pendingInvitationCount > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-error px-1.5 text-[11px] font-semibold text-white">
                {pendingInvitationCount > 99 ? "99+" : pendingInvitationCount}
              </span>
            )}
            <ChevronRight className="h-4 w-4 text-text-secondary shrink-0" />
          </Link>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Manage</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Link
            href="/manage"
            className="flex items-center gap-3 px-6 py-4 hover:bg-surface-variant transition-colors"
          >
            <Settings2 className="h-5 w-5 text-text-secondary shrink-0" />
            <span className="flex-1 text-sm font-medium text-text">Manage Items & Categories</span>
            <ChevronRight className="h-4 w-4 text-text-secondary shrink-0" />
          </Link>
        </CardContent>
      </Card>

      <PaymentMethodsSection />

      <Button variant="destructive" className="w-full" onClick={logout}>
        <LogOut className="h-4 w-4 mr-2" /> Logout
      </Button>
    </div>
  );
}
