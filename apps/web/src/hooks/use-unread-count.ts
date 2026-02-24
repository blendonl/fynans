import { useQuery } from "@tanstack/react-query";
import { notificationControllerGetUnreadCount } from "@/api/generated/endpoints/notification/notification";
import { queryKeys } from "@/lib/query-keys";

/** Lightweight hook for just the unread notification count. */
export function useUnreadCount() {
  const query = useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: async () => {
      const res = await notificationControllerGetUnreadCount();
      return res.data.count;
    },
    staleTime: 30_000,
  });

  return {
    unreadCount: query.data ?? 0,
    isLoading: query.isLoading,
  };
}
