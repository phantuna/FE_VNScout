"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Heart,
  MessageCircle,
  UserPlus,
  MapPin,
  AtSign,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { Notification } from "@/types"
import { formatRelativeTime } from "@/utils/date"

export const NOTIFICATION_ICONS: Record<string, { icon: typeof Heart; className: string }> = {
  like: { icon: Heart, className: "text-red-500" },
  comment: { icon: MessageCircle, className: "text-primary" },
  follow: { icon: UserPlus, className: "text-accent" },
  new_post: { icon: MessageCircle, className: "text-orange-500" },
  checkin: { icon: MapPin, className: "text-accent" },
  mention: { icon: AtSign, className: "text-primary" },
}

interface NotificationItemProps {
  notification: Notification
  onRead: (id: string) => void
}

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const config = NOTIFICATION_ICONS[notification.type] || { icon: MessageCircle, className: "text-primary" }
  const Icon = config.icon

  const router = useRouter()

  return (
    <div
      onClick={() => {
        if (!notification.isRead) {
          onRead(notification.id)
        }
        if (notification.postId) {
          router.push(`/post/${notification.postId}`)
        } else if (notification.actor.id) {
          router.push(`/profile/${notification.actor.id}`)
        }
      }}
      className={cn(
        "group flex items-center gap-4 rounded-lg px-4 py-3 transition-colors hover:bg-muted cursor-pointer",
        !notification.isRead && "bg-primary/5"
      )}
    >
      <div className="relative shrink-0">
        <Link href={`/profile/${notification.actor.id}`} onClick={(e) => e.stopPropagation()}>
          <Avatar className="h-11 w-11">
            <AvatarImage
              src={notification.actor.avatarUrl || "/default-avatar.svg"}
              alt={notification.actor.username}
            />
            <AvatarFallback>
              {notification.actor.username?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div
          className={cn(
            "absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-card ring-2 ring-card",
            config.className
          )}
        >
          <Icon className="h-3 w-3" />
        </div>
      </div>

      <div className="flex-1">
        <p className="text-sm text-foreground">
          <Link
            href={`/profile/${notification.actor.id}`}
            className="font-semibold hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {notification.actor.username}
          </Link>{" "}
          <span className="transition-colors group-hover:text-primary">
            {notification.message}
          </span>
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>

      {notification.postImage && (
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
          <Image
            src={notification.postImage || "/placeholder.svg"}
            alt="Post thumbnail"
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>
      )}

      {notification.type === "follow" && (
        <Button size="sm" className="shrink-0 text-xs">
          Follow
        </Button>
      )}

      {!notification.isRead && (
        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
      )}
    </div>
  )
}
