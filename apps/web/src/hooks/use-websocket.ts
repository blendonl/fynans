"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import { websocketService } from "@/lib/websocket";

export function useWebSocket() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token) return;

    websocketService.connect(token);

    const handleNewNotification = (data: unknown) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });

      if (typeof window === "undefined" || !("Notification" in window)) return;
      if (Notification.permission !== "granted") return;

      const notification = data as { title?: string; message?: string };
      new Notification(notification.title ?? "Fynans", {
        body: notification.message ?? "You have a new notification",
        icon: "/icon-192x192.png",
      });
    };

    websocketService.on("notification:new", handleNewNotification);

    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission();
    }

    return () => {
      websocketService.off("notification:new", handleNewNotification);
      websocketService.disconnect();
    };
  }, [token, queryClient]);
}
