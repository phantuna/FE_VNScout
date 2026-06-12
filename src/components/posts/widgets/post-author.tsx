"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Info } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { type Post } from "@/types"
import { useAuth } from "@/context/AuthContext"
import { apiFetch } from "@/services/api.service"
import { showLoginRequiredToast, showErrorToast } from "@/lib/toast-utils"

interface PostAuthorSectionProps {
  post: Post
}

export function PostAuthorSection({ post }: PostAuthorSectionProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [isFollowing, setIsFollowing] = useState(false)
  const [isFollowLoading, setIsFollowLoading] = useState(false)

  const displayCaption = post.caption || ""

  useEffect(() => {
    async function checkFollowStatus() {
      if (!user || !post.author?.id) return
      try {
        const res = await apiFetch(`/api/v1/follow/status?followerId=${user.id}&followingId=${post.author.id}`)
        setIsFollowing(res.following)
      } catch (err) {
        console.error("Failed to fetch follow status", err)
      }
    }
    checkFollowStatus()
  }, [user, post.author?.id])

  const handleToggleFollow = async () => {
    if (!user) {
      showLoginRequiredToast(router)
      return
    }
    if (user.id === post.author?.id) return // Can't follow yourself
    if (isFollowLoading) return

    setIsFollowLoading(true)
    try {
      const res = await apiFetch(`/api/v1/follow/${post.author.id}?followerId=${user.id}`, { method: "POST" })
      setIsFollowing(res.following)
    } catch (err) {
      showErrorToast("Lỗi", "Không thể thực hiện thao tác theo dõi.")
    } finally {
      setIsFollowLoading(false)
    }
  }

  return (
    <section className="rounded-[2.5rem] border border-slate-100 bg-white p-6 sm:p-8 shadow-sm">
      <div className="flex items-center gap-4 mb-8">
        <Avatar className="h-12 w-12 ring-2 ring-primary/10 ring-offset-2">
          <AvatarImage src={post.author.avatarUrl || "/default-avatar.svg"} />
          <AvatarFallback>{post.author.username?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chia sẻ bởi</p>
          <h4 className="font-bold text-slate-900 flex items-center gap-2">
            {post.author.username}
            {post.author.levelTitle && (
              <Badge className="bg-primary/10 text-primary text-[10px] px-1.5 py-0 rounded-sm border-none">
                {post.author.levelTitle} • Lvl {post.author.level}
              </Badge>
            )}
          </h4>
        </div>
        {user?.id !== post.author?.id && (
          <Button
            variant={isFollowing ? "secondary" : "outline"}
            size="sm"
            onClick={handleToggleFollow}
            disabled={isFollowLoading}
            className={cn(
              "ml-auto rounded-full font-bold px-4 h-9 transition-all duration-300 min-w-[100px]",
              isFollowing
                ? "bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 group"
                : "text-primary border-primary hover:bg-primary hover:text-white"
            )}
          >
            {isFollowLoading ? (
              <span className="animate-pulse">Đang tải...</span>
            ) : isFollowing ? (
              <>
                <span className="block group-hover:hidden">Đang theo dõi</span>
                <span className="hidden group-hover:block">Bỏ theo dõi</span>
              </>
            ) : (
              "Theo dõi"
            )}
          </Button>
        )}
      </div>
      <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
        <Info className="h-5 w-5 text-primary" />Giới thiệu
      </h3>
      <p className="text-base leading-8 text-slate-600 whitespace-pre-wrap">{displayCaption}</p>
      {(post.tags || []).length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {(post.tags || []).map((tag, idx) => (
            <span key={`${tag}-${idx}`} className="rounded-full bg-slate-100 px-4 py-1.5 text-xs font-bold text-slate-500">#{tag}</span>
          ))}
        </div>
      )}
    </section>
  )
}
