"use client";

import { useAuth } from "@/providers/auth-provider";
import { useWebSocket } from "@/hooks/use-websocket";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();
  useWebSocket();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto p-4 pb-20 sm:p-6 lg:pb-6">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
      <MobileNav />
    </div>
  );
}
