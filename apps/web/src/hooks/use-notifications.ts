import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { PAGE_SIZE, type PaginatedResponse } from "@/lib/pagination";
import type { Notification } from "@fynans/shared";

interface UseNotificationsOptions {
  filter?: "all" | "unread";
}

type NotificationPage = PaginatedResponse<Notification>;

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { filter = "all" } = options;
  const queryClient = useQueryClient();

  const notificationsQuery = useInfiniteQuery({
    queryKey: ["notifications", filter],
    queryFn: async ({ pageParam = 1 }) => {
      const params: Record<string, string> = {
        page: String(pageParam),
        limit: String(PAGE_SIZE),
      };
      if (filter === "unread") params.unreadOnly = "true";

      return apiClient.get(
        "/notifications",
        params
      ) as Promise<NotificationPage>;
    },
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      return (lastPageParam as number) * PAGE_SIZE < lastPage.total
        ? (lastPageParam as number) + 1
        : undefined;
    },
    initialPageParam: 1,
  });

  const unreadCountQuery = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const res = (await apiClient.get("/notifications/unread-count")) as {
        count: number;
      };
      return res.count;
    },
  });

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.patch(`/notifications/${id}/read`, {});
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });

      const previousAll = queryClient.getQueryData<
        InfiniteData<NotificationPage>
      >(["notifications", "all"]);
      const previousUnread = queryClient.getQueryData<
        InfiniteData<NotificationPage>
      >(["notifications", "unread"]);
      const previousCount = queryClient.getQueryData<number>([
        "notifications",
        "unread-count",
      ]);

      queryClient.setQueryData<InfiniteData<NotificationPage>>(
        ["notifications", "all"],
        (old) =>
          old
            ? {
                ...old,
                pages: old.pages.map((page) => ({
                  ...page,
                  data: page.data.map((n) =>
                    n.id === id ? { ...n, isRead: true } : n
                  ),
                })),
              }
            : old
      );

      queryClient.setQueryData<InfiniteData<NotificationPage>>(
        ["notifications", "unread"],
        (old) =>
          old
            ? {
                ...old,
                pages: old.pages.map((page) => ({
                  ...page,
                  data: page.data.filter((n) => n.id !== id),
                  total: page.total - 1,
                })),
              }
            : old
      );

      queryClient.setQueryData<number>(
        ["notifications", "unread-count"],
        (old) => (old != null && old > 0 ? old - 1 : 0)
      );

      return { previousAll, previousUnread, previousCount };
    },
    onError: (_err, _id, context) => {
      if (context?.previousAll)
        queryClient.setQueryData(["notifications", "all"], context.previousAll);
      if (context?.previousUnread)
        queryClient.setQueryData(
          ["notifications", "unread"],
          context.previousUnread
        );
      if (context?.previousCount != null)
        queryClient.setQueryData(
          ["notifications", "unread-count"],
          context.previousCount
        );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      await apiClient.post("/notifications/mark-all-read", {});
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });

      const previousAll = queryClient.getQueryData<
        InfiniteData<NotificationPage>
      >(["notifications", "all"]);
      const previousUnread = queryClient.getQueryData<
        InfiniteData<NotificationPage>
      >(["notifications", "unread"]);
      const previousCount = queryClient.getQueryData<number>([
        "notifications",
        "unread-count",
      ]);

      queryClient.setQueryData<InfiniteData<NotificationPage>>(
        ["notifications", "all"],
        (old) =>
          old
            ? {
                ...old,
                pages: old.pages.map((page) => ({
                  ...page,
                  data: page.data.map((n) => ({ ...n, isRead: true })),
                })),
              }
            : old
      );

      queryClient.setQueryData<InfiniteData<NotificationPage>>(
        ["notifications", "unread"],
        (old) =>
          old
            ? {
                ...old,
                pages: old.pages.map((page) => ({
                  ...page,
                  data: [],
                  total: 0,
                })),
              }
            : old
      );

      queryClient.setQueryData<number>(
        ["notifications", "unread-count"],
        0
      );

      return { previousAll, previousUnread, previousCount };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousAll)
        queryClient.setQueryData(["notifications", "all"], context.previousAll);
      if (context?.previousUnread)
        queryClient.setQueryData(
          ["notifications", "unread"],
          context.previousUnread
        );
      if (context?.previousCount != null)
        queryClient.setQueryData(
          ["notifications", "unread-count"],
          context.previousCount
        );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const deleteNotification = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/notifications/${id}`);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });

      const previousAll = queryClient.getQueryData<
        InfiniteData<NotificationPage>
      >(["notifications", "all"]);
      const previousUnread = queryClient.getQueryData<
        InfiniteData<NotificationPage>
      >(["notifications", "unread"]);
      const previousCount = queryClient.getQueryData<number>([
        "notifications",
        "unread-count",
      ]);

      // Check if the notification being deleted is unread
      const isUnread = previousAll?.pages
        .flatMap((p) => p.data)
        .find((n) => n.id === id && !n.isRead);

      queryClient.setQueryData<InfiniteData<NotificationPage>>(
        ["notifications", "all"],
        (old) =>
          old
            ? {
                ...old,
                pages: old.pages.map((page) => ({
                  ...page,
                  data: page.data.filter((n) => n.id !== id),
                  total: page.total - 1,
                })),
              }
            : old
      );

      queryClient.setQueryData<InfiniteData<NotificationPage>>(
        ["notifications", "unread"],
        (old) =>
          old
            ? {
                ...old,
                pages: old.pages.map((page) => ({
                  ...page,
                  data: page.data.filter((n) => n.id !== id),
                  total: page.total - 1,
                })),
              }
            : old
      );

      if (isUnread) {
        queryClient.setQueryData<number>(
          ["notifications", "unread-count"],
          (old) => (old != null && old > 0 ? old - 1 : 0)
        );
      }

      return { previousAll, previousUnread, previousCount };
    },
    onError: (_err, _id, context) => {
      if (context?.previousAll)
        queryClient.setQueryData(["notifications", "all"], context.previousAll);
      if (context?.previousUnread)
        queryClient.setQueryData(
          ["notifications", "unread"],
          context.previousUnread
        );
      if (context?.previousCount != null)
        queryClient.setQueryData(
          ["notifications", "unread-count"],
          context.previousCount
        );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
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
