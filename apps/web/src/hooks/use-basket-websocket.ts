"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { websocketService } from "@/lib/websocket";

const BASKET_EVENTS = new Set([
  "BASKET_ITEM_ADDED",
  "BASKET_ITEMS_BOUGHT",
  "BASKET_ITEM_UPDATED",
  "BASKET_ITEM_REMOVED",
]);

export function useBasketWebSocket(familyId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!familyId) return;

    websocketService.subscribeToFamily(familyId);

    const handleNotification = (data: unknown) => {
      const notification = data as Record<string, unknown>;
      if (
        typeof notification?.type === "string" &&
        BASKET_EVENTS.has(notification.type)
      ) {
        queryClient.invalidateQueries({ queryKey: ["baskets"] });
      }
    };

    websocketService.on("notification:new", handleNotification);

    return () => {
      websocketService.off("notification:new", handleNotification);
      websocketService.unsubscribeFromFamily(familyId);
    };
  }, [familyId, queryClient]);
}
