"use client"

import { useState, useEffect } from "react"
import { Check, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Notification } from "@/types"
import { apiFetch } from "@/services/api.service"
import { NotificationItem } from "./widgets/notify-item"

export function NotificationsView() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<"all" | "unread">("all")

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const response = await apiFetch('/api/v1/notifications')
        if (response && response.content) {
          const formatted = response.content.map((n: any) => ({
            id: n.id,
            type: n.type === 'POST_COMMENTED' ? 'comment'
              : n.type === 'POST_LIKED' ? 'like'
              : n.type === 'NEW_FOLLOWER' ? 'follow'
              : n.type === 'NEW_POST' ? 'new_post'
              : 'mention',
            message: n.content,
            isRead: n.isRead,
            createdAt: n.createdAt || n.createdDate,
            postId: n.postId,
            actor: {
              id: n.actorId,
              username: n.actorName,
              avatarUrl: n.actorAvatar
            }
          }))
          setNotifications(formatted)
        }
      } catch (err) {
        console.error("Failed to fetch notifications", err)
      }
    }
    fetchNotifications()

    // Listen for new notifications pushed by the shared SSE in desktop-sidebar
    const handleNewNotification = (e: Event) => {
      const n = (e as CustomEvent).detail;
      if (!n) return;
      const newNotif = {
        id: n.id,
        type: n.type === 'POST_COMMENTED' ? 'comment'
          : n.type === 'POST_LIKED' ? 'like'
          : n.type === 'NEW_FOLLOWER' ? 'follow'
          : n.type === 'NEW_POST' ? 'new_post'
          : 'mention',
        message: n.content,
        isRead: n.isRead,
        createdAt: n.createdAt || n.createdDate,
        postId: n.postId,
        actor: {
          id: n.actorId,
          username: n.actorName,
          avatarUrl: n.actorAvatar
        }
      };
      setNotifications(prev => {
        const exists = prev.find(p => p.id === newNotif.id);
        if (exists) {
          const filtered = prev.filter(p => p.id !== newNotif.id);
          return [newNotif as any, ...filtered];
        }
        return [newNotif as any, ...prev];
      });
    };
    window.addEventListener('newNotification', handleNewNotification);

    return () => {
      window.removeEventListener('newNotification', handleNewNotification);
    };
  }, [])

  const unreadCount = notifications.filter((n) => !n.isRead).length
  const filtered =
    filter === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-md">
        <div className="flex items-center justify-between px-6 py-3">
          <h2 className="text-lg font-bold text-foreground">Notifications</h2>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={async () => {
                await apiFetch('/api/v1/notifications/read-all', { method: 'PUT' });
                setNotifications(notifications.map(n => ({ ...n, isRead: true })));
                window.dispatchEvent(new CustomEvent('notificationRead', { detail: { action: 'clear' } }))
              }}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <Check className="h-3.5 w-3.5" />
              Mark all read
            </button>
          )}
        </div>
        <div className="flex gap-2 px-6 pb-3">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
              filter === "all"
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilter("unread")}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
              filter === "unread"
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>
      </header>

      {/* Notifications List */}
      <div className="mx-auto max-w-3xl p-4">
        <div className="space-y-1">
          {filtered.length > 0 ? (
            filtered.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={async (id) => {
                  try {
                    await apiFetch(`/api/v1/notifications/${id}/read`, { method: "PUT" })
                    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
                    window.dispatchEvent(new CustomEvent('notificationRead', { detail: { action: 'decrement' } }))
                  } catch (err) {
                    console.error("Failed to mark read", err)
                  }
                }}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <MessageCircle className="h-12 w-12" strokeWidth={1} />
              <p className="mt-3 text-sm">No notifications</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
