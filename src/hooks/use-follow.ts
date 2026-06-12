"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { showLoginRequiredToast } from "@/lib/toast-utils"
import { useRouter } from "next/navigation"
import {
  toggleFollow as apiToggleFollow,
  getFollowStatus,
  getFollowCounts,
} from "@/services/follow.service"

interface UseFollowOptions {
  /** ID của profile đang xem */
  profileUserId: string
  /** Số followers ban đầu (từ server, dùng làm giá trị khởi tạo) */
  initialFollowersCount?: number
  /** Số following ban đầu (của profile user) */
  initialFollowingCount?: number
  /** Trạng thái follow ban đầu */
  initialIsFollowing?: boolean
}

interface UseFollowReturn {
  following: boolean
  followersCount: number
  followingCount: number
  isLoading: boolean
  toggleFollow: () => Promise<void>
  canFollow: boolean // false nếu chưa đăng nhập hoặc xem profile chính mình
}

/**
 * Hook quản lý toàn bộ trạng thái follow cho một profile.
 * Tự động fetch trạng thái từ server khi mount, và cập nhật lại sau mỗi lần toggle.
 */
export function useFollow({
  profileUserId,
  initialFollowersCount = 0,
  initialFollowingCount = 0,
  initialIsFollowing = false,
}: UseFollowOptions): UseFollowReturn {
  const { user: currentUser } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const [following, setFollowing] = useState(initialIsFollowing)
  const [followersCount, setFollowersCount] = useState(initialFollowersCount)
  const [followingCount, setFollowingCount] = useState(initialFollowingCount)
  const [isLoading, setIsLoading] = useState(false)

  const isOwnProfile = currentUser?.id === profileUserId
  const canFollow = !!currentUser && !isOwnProfile

  // Fetch trạng thái thực từ server
  useEffect(() => {
    if (!profileUserId) return

    const fetchStatus = async () => {
      try {
        // Luôn lấy counts của profile user từ getFollowCounts
        const counts = await getFollowCounts(profileUserId)
        setFollowersCount(counts.followersCount)
        setFollowingCount(counts.followingCount)

        // Nếu đã đăng nhập và không xem profile chính mình → kiểm tra trạng thái follow
        if (currentUser && !isOwnProfile) {
          const status = await getFollowStatus(currentUser.id, profileUserId)
          setFollowing(status.following)
          // Cập nhật lại followersCount từ status (giá trị mới nhất từ server)
          setFollowersCount(status.followersCount)
        }
      } catch (error) {
        console.error("[useFollow] Failed to fetch follow status:", error)
      }
    }

    fetchStatus()
  }, [currentUser, profileUserId, isOwnProfile])

  const toggleFollow = useCallback(async () => {
    if (!currentUser) {
      showLoginRequiredToast(router)
      return
    }

    if (isLoading || isOwnProfile) return
    setIsLoading(true)

    // Optimistic update
    const prevFollowing = following
    const prevFollowersCount = followersCount
    setFollowing(!following)
    setFollowersCount((c) => (!following ? c + 1 : Math.max(0, c - 1)))

    try {
      const result = await apiToggleFollow(currentUser.id, profileUserId)
      // Dùng giá trị từ server để đảm bảo chính xác
      setFollowing(result.following)
      setFollowersCount(result.followersCount)
    } catch (error: any) {
      // Rollback nếu lỗi
      setFollowing(prevFollowing)
      setFollowersCount(prevFollowersCount)
      console.error("[useFollow] toggleFollow failed:", error)
      toast({
        title: "Lỗi",
        description: "Không thể thực hiện thao tác. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [currentUser, profileUserId, isLoading, isOwnProfile, following, followersCount, toast])

  return {
    following,
    followersCount,
    followingCount,
    isLoading,
    toggleFollow,
    canFollow,
  }
}
