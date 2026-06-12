"use client"

import { useAuth } from "@/context/AuthContext"
import { ProfileView } from "@/components/profile/profile-view"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { apiFetch } from "@/services/api.service"
import { type Post } from "@/types"

export default function MyProfilePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [fetchingPosts, setFetchingPosts] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    async function fetchUserPosts() {
      if (!user?.id) return
      try {
        setFetchingPosts(true)
        // For now fetch all and filter, or use a filtered endpoint if available
        const allPosts = await apiFetch("/api/v1/posts/getAll")
        const postsArray = (allPosts as any)?.content || allPosts || []
        setPosts(postsArray.filter((p: any) => p.author?.id === user.id))
      } catch (error) {
        console.error("Failed to fetch user posts:", error)
      } finally {
        setFetchingPosts(false)
      }
    }
    if (user) fetchUserPosts()
  }, [user])

  if (isLoading || !user || fetchingPosts) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return <ProfileView user={user} posts={posts} isOwnProfile showBackButton />
}
