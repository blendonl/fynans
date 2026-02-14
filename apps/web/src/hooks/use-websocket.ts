"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth-provider";
import { websocketService } from "@/lib/websocket";

export function useWebSocket() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    if (!token) return;

    websocketService.connect(token);

    const handleNewNotification = (data: unknown) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });

      const notification = data as {
        title?: string;
        message?: string;
        actionUrl?: string;
      };

      toast(notification.title ?? "Fynans", {
        description: notification.message,
        action: notification.actionUrl
          ? {
              label: "View",
              onClick: () => router.push(`/${notification.actionUrl}`),
            }
          : undefined,
      });
    };

    const handleToast = (data: unknown) => {
      const payload = data as {
        title?: string;
        message?: string;
        priority?: string;
      };

      const isHighPriority =
        payload.priority === "HIGH" || payload.priority === "URGENT";

      if (isHighPriority) {
        toast.warning(payload.title ?? "Fynans", {
          description: payload.message,
        });
      } else {
        toast(payload.title ?? "Fynans", {
          description: payload.message,
        });
      }
    };

    websocketService.on("notification:new", handleNewNotification);
    websocketService.on("notification:toast", handleToast);

    return () => {
      websocketService.off("notification:new", handleNewNotification);
      websocketService.off("notification:toast", handleToast);
      websocketService.disconnect();
    };
  }, [token, queryClient, router]);
}
