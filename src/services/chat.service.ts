import { apiFetch } from "./api.service"
import { ChatMessage, Conversation } from "@/types"

export const chatService = {
  /** Lấy danh sách conversation (inbox) */
  async getMyConversations(): Promise<Conversation[]> {
    return apiFetch("/chat/conversations", { method: "GET" })
  },

  /** Tạo hoặc lấy conversation với một user khác */
  async getOrCreateConversation(receiverId: string): Promise<Conversation> {
    return apiFetch(`/chat/conversations/${receiverId}`, { method: "POST" })
  },

  /** Lấy lịch sử tin nhắn (có phân trang) */
  async getMessages(
    conversationId: string,
    page: number = 0,
    size: number = 20
  ): Promise<{ content: ChatMessage[]; totalPages: number; last: boolean }> {
    return apiFetch(`/chat/conversations/${conversationId}/messages?page=${page}&size=${size}`, {
      method: "GET",
    })
  },

  /** Đánh dấu toàn bộ tin trong conversation là đã đọc */
  async markAsRead(conversationId: string): Promise<void> {
    return apiFetch(`/chat/conversations/${conversationId}/read`, { method: "PUT" })
  },

  /** Lấy danh sách userId đã follow nhau 2 chiều với mình */
  async getMutualFollowUserIds(userId: string): Promise<string[]> {
    return apiFetch(`/api/v1/follow/mutual?userId=${userId}`, { method: "GET" })
  },
}
