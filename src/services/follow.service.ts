import { apiFetch } from "@/services/api.service"

export interface FollowStatusResponse {
  following: boolean
  followersCount: number
  followingCount: number
}

/**
 * Toggle follow/unfollow một user
 * POST /api/v1/follow/{followingId}?followerId={followerId}
 */
export async function toggleFollow(
  followerId: string,
  followingId: string
): Promise<FollowStatusResponse> {
  return apiFetch(`/api/v1/follow/${followingId}?followerId=${followerId}`, {
    method: "POST",
  })
}

/**
 * Lấy trạng thái follow + số lượng của profile user
 * GET /api/v1/follow/status?followerId=...&followingId=...
 */
export async function getFollowStatus(
  followerId: string,
  followingId: string
): Promise<FollowStatusResponse> {
  return apiFetch(
    `/api/v1/follow/status?followerId=${followerId}&followingId=${followingId}`
  )
}

/**
 * Lấy số followers/following của một user cụ thể
 * GET /api/v1/follow/counts/{userId}
 */
export async function getFollowCounts(
  userId: string
): Promise<Pick<FollowStatusResponse, "followersCount" | "followingCount">> {
  return apiFetch(`/api/v1/follow/counts/${userId}`)
}
