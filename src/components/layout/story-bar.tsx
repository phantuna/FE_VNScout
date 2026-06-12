"use client"

import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"
import { Plus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function StoryBar() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="border-b border-border bg-card px-6 py-3">
      <div className="flex gap-4 overflow-x-auto hide-scrollbar">
        {/* Your story */}
        <button type="button" className="flex flex-col items-center gap-1.5">
          <div className="relative">
            <Avatar className="h-14 w-14 border-2 border-muted">
              <AvatarImage
                src={user.avatarUrl || "/default-avatar.svg"}
                alt="Your story"
              />
              <AvatarFallback>{user.username?.charAt(0) ?? "U"}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Plus className="h-3 w-3" strokeWidth={3} />
            </div>
          </div>
          <span className="w-14 truncate text-center text-[11px] text-muted-foreground">
            {user.username}
          </span>
        </button>
      </div>
    </div>
  )
}
