"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Trash2,
  Users,
  UserPlus,
  UserMinus,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Receipt,
  ChevronRight,
  Inbox,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import type { Notification } from "@fynans/shared";

// --- Notification type icon & color mapping ---

type NotificationMeta = {
  icon: typeof Bell;
  color: string;
  bg: string;
};

const NOTIFICATION_META: Record<string, NotificationMeta> = {
  FAMILY_INVITATION_SENT: {
    icon: UserPlus,
    color: "text-info",
    bg: "bg-info/10",
  },
  FAMILY_INVITATION_RECEIVED: {
    icon: UserPlus,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  FAMILY_INVITATION_ACCEPTED: {
    icon: Check,
    color: "text-success",
    bg: "bg-success/10",
  },
  FAMILY_INVITATION_DECLINED: {
    icon: UserMinus,
    color: "text-error",
    bg: "bg-error/10",
  },
  FAMILY_MEMBER_JOINED: {
    icon: Users,
    color: "text-success",
    bg: "bg-success/10",
  },
  FAMILY_MEMBER_LEFT: {
    icon: UserMinus,
    color: "text-text-secondary",
    bg: "bg-surface-variant",
  },
  FAMILY_EXPENSE_CREATED: {
    icon: DollarSign,
    color: "text-expense",
    bg: "bg-expense/10",
  },
  FAMILY_INCOME_CREATED: {
    icon: TrendingUp,
    color: "text-income",
    bg: "bg-income/10",
  },
  TRANSACTION_MILESTONE_BUDGET_ALERT: {
    icon: AlertTriangle,
    color: "text-warning",
    bg: "bg-warning/10",
  },
  TRANSACTION_MILESTONE_SPENDING_LIMIT: {
    icon: AlertTriangle,
    color: "text-error",
    bg: "bg-error/10",
  },
  RECEIPT_PROCESSING_COMPLETE: {
    icon: Receipt,
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
};

const DEFAULT_META: NotificationMeta = {
  icon: Bell,
  color: "text-text-secondary",
  bg: "bg-surface-variant",
};

function getNotificationMeta(type: string): NotificationMeta {
  return NOTIFICATION_META[type] || DEFAULT_META;
}

// --- Relative time formatting ---

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

// --- Date grouping ---

type DateGroup = "today" | "yesterday" | "earlier";

function getDateGroup(dateStr: string): DateGroup {
  const now = new Date();
  const date = new Date(dateStr);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date >= today) return "today";
  if (date >= yesterday) return "yesterday";
  return "earlier";
}

const GROUP_LABELS: Record<DateGroup, string> = {
  today: "Today",
  yesterday: "Yesterday",
  earlier: "Earlier",
};

function groupNotifications(
  notifications: Notification[]
): { group: DateGroup; label: string; items: Notification[] }[] {
  const groups: Record<DateGroup, Notification[]> = {
    today: [],
    yesterday: [],
    earlier: [],
  };

  for (const n of notifications) {
    groups[getDateGroup(n.createdAt)].push(n);
  }

  return (["today", "yesterday", "earlier"] as DateGroup[])
    .filter((g) => groups[g].length > 0)
    .map((g) => ({ group: g, label: GROUP_LABELS[g], items: groups[g] }));
}

// --- Priority badge ---

function PriorityBadge({ priority }: { priority?: string }) {
  if (!priority || priority === "LOW" || priority === "MEDIUM") return null;

  return (
    <Badge
      variant={priority === "URGENT" ? "destructive" : "outline"}
      className={cn(
        "text-[10px] px-1.5 py-0 h-4 font-semibold",
        priority === "HIGH" && "border-warning/40 text-warning bg-warning/5"
      )}
    >
      {priority === "URGENT" ? "Urgent" : "Important"}
    </Badge>
  );
}

// --- Notification row ---

function NotificationRow({
  notification,
  onRead,
  onDelete,
  onClick,
}: {
  notification: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClick: (n: Notification) => void;
}) {
  const meta = getNotificationMeta(notification.type);
  const Icon = meta.icon;
  const isUnread = !notification.isRead;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(notification)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(notification);
        }
      }}
      className={cn(
        "group relative flex items-start gap-3.5 px-4 py-3.5 transition-all duration-200 cursor-pointer",
        "hover:bg-surface-variant/60 active:scale-[0.995]",
        isUnread ? "bg-primary/[0.05]" : ""
      )}
    >
      {/* Unread accent */}
      {isUnread && (
        <div className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-r-full bg-primary" />
      )}

      {/* Type icon */}
      <div
        className={cn(
          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
          meta.bg
        )}
      >
        <Icon className={cn("h-[18px] w-[18px]", meta.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p
            className={cn(
              "text-sm truncate",
              isUnread ? "font-semibold text-text" : "font-normal text-text-secondary"
            )}
          >
            {notification.title}
          </p>
          <PriorityBadge priority={notification.priority} />
        </div>
        <p
          className={cn(
            "text-[13px] mt-0.5 line-clamp-2 leading-relaxed",
            isUnread ? "text-text-secondary" : "text-text-disabled"
          )}
        >
          {notification.message}
        </p>
        <p className="text-xs text-text-disabled mt-1.5">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>

      {/* Actions (visible on hover or focus) */}
      <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150">
        {isUnread && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-text-secondary hover:text-primary"
            onClick={(e) => {
              e.stopPropagation();
              onRead(notification.id);
            }}
            title="Mark as read"
          >
            <Check className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-text-secondary hover:text-error"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
          title="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Navigate chevron */}
      {notification.actionUrl && (
        <ChevronRight className="h-4 w-4 shrink-0 self-center text-text-disabled group-hover:text-text-secondary transition-colors" />
      )}
    </div>
  );
}

// --- Main page ---

export default function NotificationsPage() {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const router = useRouter();

  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications({ filter });

  const loadMoreRef = useIntersectionObserver(() => fetchNextPage(), {
    enabled: !!hasNextPage && !isFetchingNextPage,
  });

  const handleClick = useCallback(
    (notification: Notification) => {
      if (!notification.isRead) {
        markAsRead.mutate(notification.id);
      }
      if (notification.actionUrl) {
        router.push(`/${notification.actionUrl}`);
      }
    },
    [markAsRead, router]
  );

  const grouped = groupNotifications(notifications);

  return (
    <div className="space-y-5">
      {/* Header */}
      <PageHeader
        label="Updates"
        title="Notifications"
        description="Stay updated on your family and financial activity."
        className="dash-animate-in"
      >
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary-variant hover:bg-primary/5"
            onClick={() => markAllAsRead.mutate()}
          >
            <CheckCheck className="h-4 w-4 mr-1.5" />
            Mark all read
          </Button>
        )}
      </PageHeader>

      {/* Filter tabs */}
      <div className="dash-animate-in dash-delay-1">
        <Tabs
          value={filter}
          onValueChange={(v) => setFilter(v as "all" | "unread")}
        >
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="all" className="flex-1 sm:flex-none gap-1.5">
              <Inbox className="h-3.5 w-3.5" />
              All
            </TabsTrigger>
            <TabsTrigger
              value="unread"
              className="flex-1 sm:flex-none gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Unread
              {unreadCount > 0 && (
                <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary/15 px-1 text-[10px] font-semibold text-primary">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-2 dash-animate-in dash-delay-2">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex items-start gap-3.5 rounded-xl px-4 py-3.5"
            >
              <div className="h-9 w-9 rounded-xl skeleton-shimmer shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 rounded-lg skeleton-shimmer" />
                <div className="h-3.5 w-2/3 rounded-lg skeleton-shimmer" />
                <div className="h-3 w-16 rounded-lg skeleton-shimmer" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="dash-animate-in dash-delay-2 flex flex-col items-center justify-center py-16 px-4">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-surface-variant">
              {filter === "unread" ? (
                <BellOff className="h-9 w-9 text-text-disabled" />
              ) : (
                <Bell className="h-9 w-9 text-text-disabled" />
              )}
            </div>
            {filter === "unread" && (
              <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-success/10">
                <Check className="h-4 w-4 text-success" />
              </div>
            )}
          </div>
          <p className="mt-5 text-sm font-medium text-text">
            {filter === "unread"
              ? "You're all caught up"
              : "No notifications yet"}
          </p>
          <p className="mt-1 text-xs text-text-disabled text-center max-w-xs">
            {filter === "unread"
              ? "All your notifications have been read. Nice work!"
              : "When you get notifications about family activity, transactions, or alerts, they'll show up here."}
          </p>
        </div>
      ) : (
        <div className="space-y-4 dash-animate-in dash-delay-2">
          {grouped.map(({ group, label, items }) => (
            <div key={group}>
              <p className="text-[11px] font-semibold text-text-disabled tracking-wide uppercase px-4 mb-1">
                {label}
              </p>
              <div className="rounded-xl border border-border bg-surface overflow-hidden divide-y divide-divider">
                {items.map((notification) => (
                  <NotificationRow
                    key={notification.id}
                    notification={notification}
                    onRead={(id) => markAsRead.mutate(id)}
                    onDelete={(id) => deleteNotification.mutate(id)}
                    onClick={handleClick}
                  />
                ))}
              </div>
            </div>
          ))}

          <div ref={loadMoreRef} className="h-1" />

          {isFetchingNextPage && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-text-secondary" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
