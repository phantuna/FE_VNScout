"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { TrendingUp, MapPin, Camera, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { apiFetch } from "@/services/api.service"
import { useAuth } from "@/context/AuthContext"

interface SuggestedUser {
  id: string
  username: string
  avatarUrl?: string
  level?: string
}

interface TagItem {
  id: string
  name: string
}

interface RecentPost {
  id: string
  author?: { username?: string; avatarUrl?: string }
  location?: { name?: string; province?: string }
  photos?: { imageUrl: string }[]
  images?: string[]
}

export function RightSidebar() {
  const { user: currentUser } = useAuth()
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([])
  const [tags, setTags] = useState<TagItem[]>([])
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAll() {
      try {
        const [usersData, tagsData, postsData] = await Promise.allSettled([
          apiFetch("/users/getall?size=50"),
          apiFetch("/api/tags/getall?size=50"),
          apiFetch("/api/v1/posts/getAll?size=50"),
        ])

        if (usersData.status === "fulfilled" && usersData.value) {
          const arr = usersData.value.content || usersData.value || []
          if (Array.isArray(arr)) {
            setSuggestedUsers(
              arr
                .filter((u: SuggestedUser) => u.id !== currentUser?.id)
                .slice(0, 10)
            )
          }
        }
        if (tagsData.status === "fulfilled" && tagsData.value) {
          const arr = tagsData.value.content || tagsData.value || []
          if (Array.isArray(arr)) {
            setTags(arr.slice(0, 10))
          }
        }
        if (postsData.status === "fulfilled" && postsData.value) {
          const arr = postsData.value.content || postsData.value || []
          if (Array.isArray(arr)) {
            const unique: RecentPost[] = [];
            const seen = new Set<string>();
            for (const p of arr) {
              const loc = p.location as any;
              if (loc && loc.level === 2 && loc.deleted !== 1 && !loc.isHidden) {
                const locId = loc.id || loc.name;
                if (locId && !seen.has(locId)) {
                  seen.add(locId);
                  unique.push(p);
                }
              }
              if (unique.length >= 10) break;
            }
            setRecentPosts(unique);
          }
        }
      } catch (_) {
        // Silent fail — sidebar is decorative, not critical
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [currentUser?.id])

  return (
    <aside className="hidden w-[300px] shrink-0 xl:block col-span-4">
      <div className="sticky top-4 h-[calc(100vh-2rem)] overflow-y-auto pb-8 space-y-8 hide-scrollbar">

        {/* Current User Card */}
        {currentUser && (
          <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
            <Avatar className="h-12 w-12 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
              <AvatarImage src={currentUser.avatarUrl || "/default-avatar.svg"} alt={currentUser.username} />
              <AvatarFallback className="font-bold text-lg">
                {currentUser.username?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="truncate text-sm font-bold text-foreground">{currentUser.username}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-primary/70">
                {currentUser.level || "Explorer"}
              </p>
            </div>
            <Link
              href="/profile"
              className="ml-auto text-xs font-bold text-primary hover:underline shrink-0"
            >
              Hồ sơ
            </Link>
          </div>
        )}

        {/* Suggested Photographers */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <Camera className="h-3.5 w-3.5 text-primary" />
              Nhiếp ảnh gia gợi ý
            </h3>
            <Link href="/explore?tab=photographers" className="text-xs font-semibold text-primary hover:underline">
              Xem tất cả
            </Link>
          </div>

          {loading ? (
            <div className="flex py-6 justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/30" />
            </div>
          ) : suggestedUsers.length > 0 ? (
            <div className="space-y-3">
              {suggestedUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-muted transition-colors">
                  <Link href={`/profile/${user.id}`}>
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatarUrl || "/default-avatar.svg"} alt={user.username} />
                      <AvatarFallback className="text-sm font-bold">
                        {user.username?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1 overflow-hidden">
                    <Link
                      href={`/profile/${user.id}`}
                      className="block truncate text-sm font-semibold text-foreground hover:text-primary transition-colors"
                    >
                      {user.username}
                    </Link>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                      {user.level || "Explorer"}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="h-7 px-3 text-[11px] font-bold shrink-0">
                    Follow
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">Chưa có người dùng nào</p>
          )}
        </div>

        {/* Trending Tags — từ database thực */}
        <div>
          <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            Hashtag thịnh hành
          </h3>
          {tags.length > 0 ? (
            <div className="space-y-1">
              {tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/explore?tag=${tag.name}`}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors hover:bg-muted group"
                >
                  <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                    #{tag.name}
                  </span>
                  <TrendingUp className="h-3 w-3 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">Chưa có hashtag nào</p>
          )}
        </div>

        {/* Recent Check-ins — từ bài viết thực */}
        <div>
          <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            Check-in gần đây
          </h3>
          {recentPosts.length > 0 ? (
            <div className="space-y-2">
              {recentPosts.map((post) => {
                const thumb = post.photos?.[0]?.imageUrl || post.images?.[0]
                return (
                  <Link
                    key={post.id}
                    href={`/post/${post.id}`}
                    className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted group"
                  >
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-muted">
                      {thumb ? (
                        <Image
                          src={thumb}
                          alt={post.location?.name || "Check-in"}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                          sizes="44px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <MapPin className="h-4 w-4 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                        {post.author?.username || "Ẩn danh"}
                      </p>
                      <p className="truncate text-[10px] text-muted-foreground">
                        {post.location?.name || "Địa điểm không xác định"}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">Chưa có check-in nào</p>
          )}
        </div>

        {/* Footer */}
        <div className="text-[10px] leading-relaxed text-muted-foreground border-t border-border pt-6">
          <p className="font-bold text-primary/60">Vietnam Photo Scout · VPS</p>
          <p className="mt-1">Khám phá và chia sẻ những khoảnh khắc đẹp khắp Việt Nam.</p>
          <p className="mt-3">© 2026 VPS Team</p>
        </div>
      </div>
    </aside>
  )
}
