"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { type Post } from "@/types"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/services/api.service"

interface PostRatingProps {
  post: Post
  setPost: React.Dispatch<React.SetStateAction<Post | null>>
  showLoginToast: () => void
}

export function PostRating({ post, setPost, showLoginToast }: PostRatingProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isRating, setIsRating] = useState(false)
  const [userRating, setUserRating] = useState(0)

  const handleRate = async (stars: number) => {
    if (!user) { showLoginToast(); return }
    if (isRating) return
    setIsRating(true)
    try {
      await apiFetch(`/api/posts/${post.id}/rate`, { method: "POST", body: JSON.stringify({ ratingValue: stars }) })
      setUserRating(stars)
      toast({ title: "Thành công", description: `Đã đánh giá ${stars} sao` })
      setPost(prev => prev ? {
        ...prev,
        totalRatings: (prev.totalRatings || 0) + 1,
        averageRating: prev.averageRating
          ? ((prev.averageRating * (prev.totalRatings || 0)) + stars) / ((prev.totalRatings || 0) + 1)
          : stars
      } : null)
    } catch {
      toast({ title: "Lỗi", description: "Không thể gửi đánh giá", variant: "destructive" })
    } finally {
      setIsRating(false)
    }
  }

  return (
    <section className="rounded-[2.5rem] border border-slate-100 bg-white p-6 sm:p-8 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
          Đánh giá ảnh
        </h3>
        <Badge variant="outline" className="font-bold bg-yellow-50 border-yellow-200 text-yellow-700">
          {post.averageRating ? post.averageRating.toFixed(1) : "0.0"} / 5.0 ({post.totalRatings || 0} lượt)
        </Badge>
      </div>
      <div className="flex items-center justify-center gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => handleRate(star)}
            disabled={isRating}
            className="group p-2 transition-transform hover:scale-125 active:scale-95"
          >
            <Star className={cn("h-8 w-8 transition-colors", userRating >= star ? "fill-yellow-400 text-yellow-400" : "text-slate-200 group-hover:text-yellow-200")} />
          </button>
        ))}
      </div>
    </section>
  )
}
