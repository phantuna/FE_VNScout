"use client"

import { useEffect, useState, useRef } from "react"
import { useAuth } from "@/context/AuthContext"
import { chatService } from "@/services/chat.service"
import { useChat } from "@/hooks/useChat"
import { Conversation, ChatMessage, User } from "@/types"
import { getAllUsers } from "@/services/user.service"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, User as UserIcon, MessageCircle, Search } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import { formatRelativeTime, formatTimeOnly, parseUTCDate } from "@/utils/date"
import Link from "next/link"

export default function MessagesPage() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [history, setHistory] = useState<ChatMessage[]>([])
  const [inputMsg, setInputMsg] = useState("")
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  const { connect, disconnect, sendMessage, isConnected, messages, clearMessages, setMessages } = useChat()

  useEffect(() => {
    if (!user) return
    chatService.getMyConversations().then(setConversations).catch(console.error)
    getAllUsers().then(setAllUsers).catch(console.error)
  }, [user])

  useEffect(() => {
    if (user) {
      connect(user.id)
    }
    return () => disconnect()
  }, [user, connect, disconnect])

  useEffect(() => {
    if (!activeConversation) return

    chatService.getMessages(activeConversation.id, 0, 50).then((data: { content: ChatMessage[] }) => {
      setHistory(data.content.reverse())
      clearMessages()
      if (activeConversation.unreadCount > 0) {
        chatService.markAsRead(activeConversation.id).catch(console.error)
        setConversations(prev => prev.map(c =>
          c.id === activeConversation.id ? { ...c, unreadCount: 0 } : c
        ))
      }
    }).catch(console.error)

  }, [activeConversation, clearMessages])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [history, messages])

  useEffect(() => {
    const total = conversations.reduce((sum, c) => sum + c.unreadCount, 0)
    window.dispatchEvent(new CustomEvent('chatUnreadUpdate', { detail: total }))
  }, [conversations])

  useEffect(() => {
    if (messages.length === 0) return

    const latestMsg = messages[messages.length - 1]

    setConversations(prev => {
      const convIndex = prev.findIndex(c => c.id === latestMsg.conversationId)
      if (convIndex >= 0) {
        const updatedConv = { ...prev[convIndex] }
        updatedConv.lastMessageContent = latestMsg.content
        updatedConv.lastMessageAt = latestMsg.sentAt

        if (latestMsg.senderId !== user?.id && activeConversation?.id !== updatedConv.id) {
          updatedConv.unreadCount += 1
        }

        const newConversations = [...prev]
        newConversations.splice(convIndex, 1)
        return [updatedConv, ...newConversations]
      } else {
        chatService.getMyConversations().then(setConversations).catch(console.error)
        return prev
      }
    })
  }, [messages, activeConversation, user?.id])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMsg.trim() || !activeConversation || !user) return

    const msgContent = inputMsg.trim()
    const optimisticMsg: ChatMessage = {
      id: "temp-" + Date.now(),
      conversationId: activeConversation.id,
      senderId: user.id,
      senderUsername: user.username,
      senderAvatarUrl: user.avatarUrl,
      content: msgContent,
      isRead: false,
      sentAt: new Date().toISOString(),
    }
    setMessages(prev => [...prev, optimisticMsg])

    sendMessage(activeConversation.otherUserId, msgContent)
    setInputMsg("")
  }

  const displayMessages = [
    ...history,
    ...messages.filter((m: ChatMessage) => m.conversationId === activeConversation?.id)
  ].reduce((acc: ChatMessage[], current) => {
    const isDuplicate = acc.find(
      item => (item.id === current.id) ||
        (item.id.startsWith('temp-') && !current.id.startsWith('temp-') && item.content === current.content && item.senderId === current.senderId)
    )
    if (!isDuplicate) {
      acc.push(current)
    } else if (isDuplicate.id.startsWith('temp-') && !current.id.startsWith('temp-')) {
      const idx = acc.findIndex(i => i.id === isDuplicate.id)
      acc[idx] = current
    }
    return acc
  }, [])

  if (!user) {
    return <div className="p-8 text-center text-muted-foreground">Vui lòng đăng nhập để xem tin nhắn.</div>
  }

  const filteredUsers = allUsers.filter(u =>
    u.id !== user?.id && u.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const startNewChat = async (targetUser: User) => {
    try {
      const conv = await chatService.getOrCreateConversation(targetUser.id)
      setConversations(prev => {
        if (!prev.find(c => c.id === conv.id)) {
          return [conv, ...prev]
        }
        return prev
      })
      setActiveConversation(conv)
      setSearchQuery("")
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="flex h-screen bg-background pt-0">
      <div className="w-1/3 min-w-[300px] border-r border-border bg-card flex flex-col h-full">
        <div className="p-4 border-b border-border">
          <h2 className="text-xl font-semibold font-serif mb-4">Tin nhắn</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm người dùng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-muted/50 border-none h-9"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {searchQuery ? (
            <div className="py-2">
              <p className="px-4 text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Kết quả tìm kiếm</p>
              {filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">Không tìm thấy người dùng.</div>
              ) : (
                filteredUsers.map(u => (
                  <div
                    key={u.id}
                    onClick={() => startNewChat(u)}
                    className="flex items-center gap-3 p-3 mx-2 rounded-lg transition-colors cursor-pointer hover:bg-muted"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={u.avatarUrl || "/default-avatar.svg"} />
                      <AvatarFallback>{u.username?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{u.username}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <>
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  Chưa có cuộc trò chuyện nào. <br /> Hãy tìm kiếm để bắt đầu!
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConversation(conv)}
                    className={`flex items-center gap-3 p-4 cursor-pointer transition-colors border-b border-border/50 hover:bg-muted ${activeConversation?.id === conv.id ? "bg-muted" : ""
                      }`}
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={conv.otherUserAvatarUrl || "/default-avatar.svg"} />
                      <AvatarFallback>{conv.otherUserUsername?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <p className="font-medium truncate">{conv.otherUserUsername}</p>
                        {conv.lastMessageAt && (
                          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                            {formatRelativeTime(conv.lastMessageAt)}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm truncate ${conv.unreadCount > 0 ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                        {conv.lastMessageContent || "Bắt đầu trò chuyện..."}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                        {conv.unreadCount}
                      </div>
                    )}
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-background h-full">
        {activeConversation ? (
          <>
            <div className="h-[73px] border-b border-border p-4 flex items-center gap-3 bg-card shrink-0">
              <Link href={`/profile/${activeConversation.otherUserId}`}>
                <Avatar className="h-10 w-10 transition-opacity hover:opacity-80 cursor-pointer">
                  <AvatarImage src={activeConversation.otherUserAvatarUrl || "/default-avatar.svg"} />
                  <AvatarFallback>{activeConversation.otherUserUsername?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <Link href={`/profile/${activeConversation.otherUserId}`} className="hover:underline">
                  <p className="font-medium">{activeConversation.otherUserUsername}</p>
                </Link>
                <p className={`text-xs ${isConnected ? "text-green-500" : "text-muted-foreground"}`}>
                  {isConnected ? "Đã kết nối" : "Đang ngắt kết nối..."}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
              {displayMessages.map((msg, index) => {
                const isMe = msg.senderId === user.id
                return (
                  <div key={index} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMe
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted text-foreground rounded-tl-sm"
                      }`}>
                      <p className="text-sm">{msg.content}</p>
                      <span className={`text-[10px] block mt-1 ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {formatTimeOnly(msg.sentAt)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="p-4 bg-card border-t border-border shrink-0">
              <form onSubmit={handleSend} className="flex gap-2">
                <Input
                  value={inputMsg}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputMsg(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 rounded-full bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!inputMsg.trim() || !isConnected}
                  className="rounded-full bg-primary hover:bg-primary/90 transition-transform active:scale-95"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <MessageCircle className="h-16 w-16 mb-4 opacity-20" />
            <p>Chọn một cuộc trò chuyện để bắt đầu</p>
          </div>
        )}
      </div>
    </div>
  )
}
