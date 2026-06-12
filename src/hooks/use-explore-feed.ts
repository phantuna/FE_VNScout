import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { apiFetch } from "@/services/api.service"
import { useToast } from "@/hooks/use-toast"
import { showLoginRequiredToast } from "@/lib/toast-utils"
import { type Post, type User } from "@/types"

export interface TagItem {
  id: string
  name: string
  postCount?: number
}

export function useExploreFeed() {
  const [activeTab, setActiveTab] = useState<"photos" | "photographers" | "tags">("photos")
  const [searchQuery, setSearchQuery] = useState("")
  const [posts, setPosts] = useState<Post[]>(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("explore_posts")
      if (saved) {
        const parsed = JSON.parse(saved)
        return Array.isArray(parsed) ? parsed : (parsed?.content || [])
      }
    }
    return []
  })
  const [users, setUsers] = useState<User[]>(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("explore_users")
      if (saved) return JSON.parse(saved)
    }
    return []
  })
  const [tags, setTags] = useState<TagItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("explore_tags")
      if (saved) return JSON.parse(saved)
    }
    return []
  })
  const [loading, setLoading] = useState(() => {
    if (typeof window !== "undefined") {
      return !sessionStorage.getItem("explore_posts")
    }
    return true
  })
  // Track IDs mình đang follow
  const [followingSet, setFollowingSet] = useState<Set<string>>(new Set())
  const [followLoading, setFollowLoading] = useState<string | null>(null)

  // Track danh sách post đã được lưu
  const [savedSet, setSavedSet] = useState<Set<string>>(new Set())

  // Track valid location ids to filter hidden/deleted locations
  const [validLocationIds, setValidLocationIds] = useState<Set<string>>(new Set())

  // Pagination states
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [visibleExplorePostsCount, setVisibleExplorePostsCount] = useState(20)

  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const { signal } = controller;

    async function fetchData() {
      if (isMounted) setLoading(true)
      try {
        const [postsRes, usersRes, locationsRes] = await Promise.allSettled([
          apiFetch(user ? `/api/v1/posts/getAll?size=20&page=0&viewerId=${user.id}` : "/api/v1/posts/getAll?size=20&page=0", { signal }),
          apiFetch("/users/getall?size=50", { signal }),
          apiFetch("/api/locations?size=10000", { signal })
        ])
        
        if (!isMounted) return

        if (postsRes.status === "fulfilled" && postsRes.value) {
          const postsArray = (postsRes.value as any)?.content || postsRes.value || []
          if (Array.isArray(postsArray)) {
            const sortedPosts = [...postsArray].sort((a: any, b: any) => {
            const dateA = a.createdDate ? new Date(a.createdDate).getTime() : 0
            const dateB = b.createdDate ? new Date(b.createdDate).getTime() : 0
              return dateB - dateA
            })
            setPosts(sortedPosts)
            sessionStorage.setItem("explore_posts", JSON.stringify(sortedPosts))
          }
        }
        if (usersRes.status === "fulfilled" && usersRes.value) {
          const arr = usersRes.value.content || usersRes.value || []
          if (Array.isArray(arr) && isMounted) {
            setUsers(arr)
            sessionStorage.setItem("explore_users", JSON.stringify(arr))
          }
        }
        if (locationsRes.status === "fulfilled" && isMounted) {
          const locsArray = locationsRes.value?.content || locationsRes.value || []
          if (Array.isArray(locsArray)) {
            setValidLocationIds(new Set(locsArray.map((l: any) => l.id)))
          }
        }
      } catch {
        // Thầm lặng bỏ qua lỗi Abort/Fetch
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchData()
    return () => {
      isMounted = false
    }
  }, [user])

  const fetchMorePosts = async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const nextPage = page + 1
      const res = await apiFetch(user ? `/api/v1/posts/getAll?size=20&page=${nextPage}&viewerId=${user.id}` : `/api/v1/posts/getAll?size=20&page=${nextPage}`)
      const newPosts = res?.content || res || []
      
      if (newPosts.length < 20) {
        setHasMore(false)
      }
      
      if (newPosts.length > 0) {
        setPosts(prev => {
          const combined = [...prev, ...newPosts]
          // Filter duplicates
          const uniquePosts = combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)
          sessionStorage.setItem("explore_posts", JSON.stringify(uniquePosts))
          return uniquePosts
        })
        setPage(nextPage)
      }
    } catch (e) {
      console.error("Lỗi khi load thêm bài viết:", e)
    } finally {
      setLoadingMore(false)
    }
  }

  // Fetch follow status khi biết user & danh sách users
  useEffect(() => {
    if (!user || users.length === 0) return
    let isMounted = true

    // Thay vì gọi N+1 request gây lỗi 429 Too Many Requests, gọi 1 request lấy danh sách ID
    apiFetch(`/api/v1/follow/following-ids/${user.id}`)
      .then((followingIds: string[]) => {
        if (isMounted && Array.isArray(followingIds)) {
          setFollowingSet(new Set(followingIds))
        }
      })
      .catch(() => {
        // Bỏ qua lỗi Abort
      })

    return () => {
      isMounted = false
    }
  }, [user, users.length])

  const handleToggleFollow = async (targetUserId: string) => {
    if (!user || followLoading) return
    setFollowLoading(targetUserId)
    try {
      const res = await apiFetch(
        `/api/v1/follow/${targetUserId}?followerId=${user.id}`,
        { method: "POST" }
      )
      setFollowingSet(prev => {
        const next = new Set(prev)
        if (res.following) next.add(targetUserId)
        else next.delete(targetUserId)
        return next
      })
      // Cập nhật số followers trong danh sách
      setUsers(prev => prev.map(u =>
        u.id === targetUserId
          ? { ...u, followersCount: res.followersCount }
          : u
      ))
    } catch (e) {
      console.error(e)
    } finally {
      setFollowLoading(null)
    }
  }

  // Khởi tạo danh sách post đã lưu khi danh sách bài đăng thay đổi
  useEffect(() => {
    if (posts.length > 0) {
      const initialSaved = new Set(
        posts.filter(p => p.isSaved).map(p => p.id)
      )
      setSavedSet(initialSaved)
    }
  }, [posts])

  // Lưu và khôi phục vị trí cuộn
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        sessionStorage.setItem("explore_scroll", window.scrollY.toString());
      }, 100);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (posts.length > 0 && !loading) {
      const savedScroll = sessionStorage.getItem("explore_scroll");
      if (savedScroll) {
        setTimeout(() => {
          window.scrollTo({ top: parseInt(savedScroll, 10), behavior: "instant" });
        }, 100);
      }
    }
  }, [posts.length, loading]);

  // Lưu/Bỏ lưu bài viết thông qua API
  const handleToggleSave = async (postId: string) => {
    if (!user) {
      showLoginRequiredToast(router)
      return
    }

    const wasSaved = savedSet.has(postId)
    
    // Cập nhật giao diện lập tức (Optimistic Update)
    setSavedSet(prev => {
      const next = new Set(prev)
      if (wasSaved) next.delete(postId)
      else next.add(postId)
      return next
    })

    try {
      await apiFetch(`/api/v1/saved/${postId}?userId=${user.id}`, {
        method: "POST"
      })
      toast({
        title: !wasSaved ? "Đã lưu thành công" : "Đã bỏ lưu",
        description: !wasSaved 
          ? "Bài viết đã được lưu vào profile cá nhân của bạn." 
          : "Đã xóa bài viết khỏi danh sách lưu của bạn.",
      })
    } catch (error) {
      console.error("Lỗi khi lưu bài viết:", error)
      // Rollback trạng thái nếu API lỗi
      setSavedSet(prev => {
        const next = new Set(prev)
        if (wasSaved) next.add(postId)
        else next.delete(postId)
        return next
      })
      toast({
        title: "Thao tác thất bại",
        description: "Có lỗi xảy ra trong quá trình lưu bài viết. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    }
  }

  const sortedTrendingTags = useMemo(() => {
    // Count occurrences of each tag across all posts
    const counts: Record<string, number> = {}
    posts.forEach((post) => {
      if (Array.isArray(post.tags)) {
        post.tags.forEach((tagName) => {
          const cleanTagName = tagName.trim()
          if (cleanTagName) {
            counts[cleanTagName] = (counts[cleanTagName] || 0) + 1
          }
        })
      }
    })

    // Map each tag to its calculated postCount or create from counts
    const mappedTags = Object.entries(counts).map(([name, count]) => {
      const existingTag = tags.find(t => t.name === name)
      return {
        id: existingTag?.id || name,
        name,
        postCount: count
      }
    })

    return mappedTags
      .sort((a, b) => (b.postCount ?? 0) - (a.postCount ?? 0))
      .slice(0, 10)
  }, [tags, posts])

  const filteredPosts = posts.filter(p =>
    !searchQuery ||
    p.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.location?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const filteredUsers = users
    .filter(u =>
      u.id !== user?.id &&
      (!searchQuery || u.username?.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => (b.followersCount ?? 0) - (a.followersCount ?? 0))

  return {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    posts,
    users,
    tags,
    loading,
    followingSet,
    followLoading,
    savedSet,
    validLocationIds,
    visibleExplorePostsCount,
    setVisibleExplorePostsCount,
    fetchMorePosts,
    hasMore,
    loadingMore,
    user,
    handleToggleFollow,
    handleToggleSave,
    sortedTrendingTags,
    filteredPosts,
    filteredUsers
  }
}
