"use client"

import { useState, useEffect } from "react"
import { ProfileView } from "@/components/profile/profile-view"
import { apiFetch } from "@/services/api.service"
import { type User, type Post } from "@/types"
import { Loader2 } from "lucide-react"
import { use } from "react"

export default function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUserData() {
      try {
        setLoading(true)

        // Fetch user data và map vào User type
        const userData = await apiFetch(`/users/${id}`)
        const mappedUser: User = {
          id: userData.id,
          username: userData.username,
          email: userData.email,
          avatarUrl: userData.avatarUrl || "/default-avatar.svg",
          bio: userData.description || userData.bio || "",
          followersCount: userData.followersCount || 0,
          followingCount: userData.followingCount || 0,
          postsCount: userData.postsCount || 0,
          level: typeof userData.level === "number" ? userData.level : 1,
          reputationScore: userData.reputationScore || 0,
          // isFollowing sẽ được useFollow hook fetch lại từ /api/v1/follow/status
          isFollowing: false,
        }
        setUser(mappedUser)

        // Fetch posts của user này
        const allPosts = await apiFetch("/api/v1/posts/getAll")
        const postsArray = (allPosts as any)?.content || allPosts || []
        setPosts((postsArray as Post[]).filter((p) => p.author?.id === id))
      } catch (error) {
        console.error("Failed to fetch profile data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchUserData()
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Không tìm thấy người dùng</p>
      </div>
    )
  }

  return <ProfileView user={user} posts={posts} showBackButton />
}
