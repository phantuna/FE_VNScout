"use client"

import { useAuth } from "@/context/AuthContext"
import { showLoginRequiredToast } from "@/lib/toast-utils"
import { useRouter } from "next/navigation"
import React from "react"

/**
 * Hook dùng chung để chặn tương tác của khách vãng lai (guest).
 * Thay vì copy-paste khối toast ở 10+ chỗ, chỉ cần gọi requireLogin().
 *
 * Ví dụ:
 *   const { requireLogin } = useGuestGuard()
 *   const handleLike = () => requireLogin(() => { ... logic like ... })
 */
export function useGuestGuard() {
  const { user } = useAuth()
  const router = useRouter()

  const requireLogin = (callback?: () => void): boolean => {
    if (!user) {
      showLoginRequiredToast(router)
      return false
    }
    callback?.()
    return true
  }

  return {
    requireLogin,
    isLoggedIn: !!user,
    user,
  }
}
