import { apiFetch } from "@/services/api.service"
import type { Notification } from "@/types"

export interface NotificationPage {
  content: Notification[]
  totalElements: number
  totalPages: number
  number: number
}

/** Lấy danh sách notifications (có phân trang) */
export async function getNotifications(
  page = 0,
  size = 20
): Promise<NotificationPage> {
  return apiFetch(`/api/v1/notifications?page=${page}&size=${size}`)
}

/** Lấy số lượng notifications chưa đọc */
export async function getUnreadCount(): Promise<{ count: number }> {
  return apiFetch("/api/v1/notifications/unread-count")
}

/** Đánh dấu một notification là đã đọc */
export async function markAsRead(notificationId: string): Promise<void> {
  return apiFetch(`/api/v1/notifications/${notificationId}/read`, {
    method: "PUT",
  })
}

/** Đánh dấu tất cả notifications là đã đọc */
export async function markAllAsRead(): Promise<void> {
  return apiFetch("/api/v1/notifications/read-all", { method: "PUT" })
}
