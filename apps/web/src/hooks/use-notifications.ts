import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from "@tanstack/react-query";
import type { Notification } from "@/types";
import {
  notificationControllerGetNotifications,
  notificationControllerGetUnreadCount,
  notificationControllerMarkAsRead,
  notificationControllerMarkAllAsRead,
  notificationControllerDeleteNotification,
} from "@/api/generated/endpoints/notification/notification";
import { queryKeys, DEFAULT_PAGE_SIZE } from "@/lib/query-keys";

interface UseNotificationsOptions {
  filter?: "all" | "unread";
}

interface NotificationPage {
  data: Notification[];
  total: number;
  page: number;
  limit: number;
}

// ── Optimistic update helpers ────────────────────────────────────────

interface NotificationSnapshot {
  previousAll: InfiniteData<NotificationPage> | undefined;
  previousUnread: InfiniteData<NotificationPage> | undefined;
  previousCount: number | undefined;
}

async function snapshotNotificationState(qc: QueryClient): Promise<NotificationSnapshot> {
  await qc.cancelQueries({ queryKey: queryKeys.notifications.all });
  return {
    previousAll: qc.getQueryData<InfiniteData<NotificationPage>>(
      queryKeys.notifications.list("all"),
    ),
    previousUnread: qc.getQueryData<InfiniteData<NotificationPage>>(
      queryKeys.notifications.list("unread"),
    ),
    previousCount: qc.getQueryData<number>(queryKeys.notifications.unreadCount()),
  };
}

function rollbackNotificationState(qc: QueryClient, snapshot: NotificationSnapshot) {
  if (snapshot.previousAll)
    qc.setQueryData(queryKeys.notifications.list("all"), snapshot.previousAll);
  if (snapshot.previousUnread)
    qc.setQueryData(queryKeys.notifications.list("unread"), snapshot.previousUnread);
  if (snapshot.previousCount != null)
    qc.setQueryData(queryKeys.notifications.unreadCount(), snapshot.previousCount);
}

function updateNotificationPages(
  qc: QueryClient,
  key: readonly unknown[],
  updater: (page: NotificationPage) => NotificationPage,
) {
  qc.setQueryData<InfiniteData<NotificationPage>>(key, (old) =>
    old ? { ...old, pages: old.pages.map(updater) } : old,
  );
}

// ── Hook ─────────────────────────────────────────────────────────────

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { filter = "all" } = options;
  const queryClient = useQueryClient();

  const notificationsQuery = useInfiniteQuery({
    queryKey: queryKeys.notifications.list(filter),
    queryFn: async ({ pageParam = 1 }) => {
      const params: Record<string, string | number | boolean> = {
        page: pageParam,
        limit: DEFAULT_PAGE_SIZE,
      };
      if (filter === "unread") params.unreadOnly = true;

      const response = await notificationControllerGetNotifications(
        params as Parameters<typeof notificationControllerGetNotifications>[0],
      );
      return response.data as NotificationPage;
    },
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      return (lastPageParam as number) * DEFAULT_PAGE_SIZE < lastPage.total
        ? (lastPageParam as number) + 1
        : undefined;
    },
    initialPageParam: 1,
  });

  const unreadCountQuery = useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: async () => {
      const res = await notificationControllerGetUnreadCount();
      return res.data.count;
    },
    staleTime: 30_000,
  });

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      await notificationControllerMarkAsRead(id);
    },
    onMutate: async (id) => {
      const snapshot = await snapshotNotificationState(queryClient);

      updateNotificationPages(queryClient, queryKeys.notifications.list("all"), (page) => ({
        ...page,
        data: page.data.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      }));

      updateNotificationPages(queryClient, queryKeys.notifications.list("unread"), (page) => ({
        ...page,
        data: page.data.filter((n) => n.id !== id),
        total: page.total - 1,
      }));

      queryClient.setQueryData<number>(
        queryKeys.notifications.unreadCount(),
        (old) => (old != null && old > 0 ? old - 1 : 0),
      );

      return snapshot;
    },
    onError: (_err, _id, context) => {
      if (context) rollbackNotificationState(queryClient, context);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      await notificationControllerMarkAllAsRead();
    },
    onMutate: async () => {
      const snapshot = await snapshotNotificationState(queryClient);

      updateNotificationPages(queryClient, queryKeys.notifications.list("all"), (page) => ({
        ...page,
        data: page.data.map((n) => ({ ...n, isRead: true })),
      }));

      updateNotificationPages(queryClient, queryKeys.notifications.list("unread"), (page) => ({
        ...page,
        data: [],
        total: 0,
      }));

      queryClient.setQueryData<number>(queryKeys.notifications.unreadCount(), 0);

      return snapshot;
    },
    onError: (_err, _vars, context) => {
      if (context) rollbackNotificationState(queryClient, context);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });

  const deleteNotification = useMutation({
    mutationFn: async (id: string) => {
      await notificationControllerDeleteNotification(id);
    },
    onMutate: async (id) => {
      const snapshot = await snapshotNotificationState(queryClient);

      const isUnread = snapshot.previousAll?.pages
        .flatMap((p) => p.data)
        .find((n) => n.id === id && !n.isRead);

      updateNotificationPages(queryClient, queryKeys.notifications.list("all"), (page) => ({
        ...page,
        data: page.data.filter((n) => n.id !== id),
        total: page.total - 1,
      }));

      updateNotificationPages(queryClient, queryKeys.notifications.list("unread"), (page) => ({
        ...page,
        data: page.data.filter((n) => n.id !== id),
        total: page.total - 1,
      }));

      if (isUnread) {
        queryClient.setQueryData<number>(
          queryKeys.notifications.unreadCount(),
          (old) => (old != null && old > 0 ? old - 1 : 0),
        );
      }

      return snapshot;
    },
    onError: (_err, _id, context) => {
      if (context) rollbackNotificationState(queryClient, context);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });

  const notifications =
    notificationsQuery.data?.pages.flatMap((page) => page.data) ?? [];
  const unreadCount = unreadCountQuery.data ?? 0;

  return {
    notifications,
    unreadCount,
    isLoading: notificationsQuery.isLoading,
    fetchNextPage: notificationsQuery.fetchNextPage,
    hasNextPage: notificationsQuery.hasNextPage,
    isFetchingNextPage: notificationsQuery.isFetchingNextPage,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}
