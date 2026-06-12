"use client"

import { MapPin, Heart, Bookmark } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { type Post } from "@/types"

interface PostHeaderActionsProps {
  post: Post
  liked: boolean
  saved: boolean
  isLiking: boolean
  isSavingPost: boolean
  onToggleLike: () => void
  onToggleSave: () => void
}

export function PostHeaderActions({ 
  post, 
  liked, 
  saved, 
  isLiking, 
  isSavingPost, 
  onToggleLike, 
  onToggleSave 
}: PostHeaderActionsProps) {
  const displayLocation = post.location?.name || "Địa điểm chưa xác định"
  const locName = post.location?.nameWithType?.trim() ?? ""
  const locProv = post.location?.province?.trim() ?? ""
  const displayAddress = post.location?.address || [locName, locProv].filter(Boolean).join(", ") || "Đang cập nhật..."

  return (
    <div className="pt-6 pb-8 border-b border-slate-100">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(post.tags || []).slice(0, 3).map((tag, idx) => (
              <Badge key={`${tag}-${idx}`} className="bg-orange-50 text-orange-600 border-none px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">{tag}</Badge>
            ))}
            <Badge className="bg-emerald-50 text-emerald-600 border-none px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
              {post.photos?.some(p => p.isLocationVerified) ? "Vị trí đã xác thực" : "Chờ xác thực vị trí"}
            </Badge>
          </div>
          <h1 className="text-3xl font-black text-slate-900 md:text-4xl lg:text-5xl tracking-tight leading-tight">{displayLocation}</h1>
          <div className="flex items-center gap-2 text-slate-500">
            <MapPin className="h-4 w-4 shrink-0" /><span className="text-sm font-medium">{displayAddress}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <button onClick={onToggleLike} disabled={isLiking} className={cn("flex h-12 w-12 items-center justify-center rounded-full border shadow-sm transition-all hover:scale-110 active:scale-95", liked ? "bg-rose-50 border-rose-100 text-rose-500" : "bg-white border-slate-200 text-slate-400")}>
            <Heart className={cn("h-6 w-6", liked && "fill-current")} />
          </button>
          <button onClick={onToggleSave} disabled={isSavingPost} className={cn("flex h-12 w-12 items-center justify-center rounded-full border shadow-sm transition-all hover:scale-110 active:scale-95", saved ? "bg-primary/5 border-primary/10 text-primary" : "bg-white border-slate-200 text-slate-400")}>
            <Bookmark className={cn("h-6 w-6", saved && "fill-current")} />
          </button>
        </div>
      </div>
    </div>
  )
}
