"use client";

import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-text-secondary">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllAsRead.mutate()}>
            <CheckCheck className="h-4 w-4 mr-2" /> Mark all read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-surface-variant animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card className="p-8 text-center">
          <Bell className="h-12 w-12 mx-auto text-text-disabled mb-4" />
          <p className="text-text-secondary">No notifications</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={cn(!notification.isRead && "border-primary/30 bg-selection-bg")}
            >
              <CardContent className="flex items-start justify-between p-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-text">{notification.title}</p>
                  <p className="text-xs text-text-secondary mt-1">{notification.message}</p>
                  <p className="text-xs text-text-disabled mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-1 ml-2">
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => markAsRead.mutate(notification.id)}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-error"
                    onClick={() => deleteNotification.mutate(notification.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
