"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/services/api.service"
import { type User } from "@/types"

interface AuthContextType {
  user: User | null
  token: string | null
  login: (token: string, userData: any) => void
  logout: () => void
  fetchUser: () => Promise<void>
  updateUserData: (newData: any) => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => { },
  logout: () => { },
  fetchUser: async () => { },
  updateUserData: () => { },
  isLoading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Load token from localStorage on mount
    const storedToken = localStorage.getItem("token")
    if (storedToken) {
      setToken(storedToken)
      fetchUser()
    } else {
      setIsLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const data = await apiFetch("/users/me")
      const mappedUser: User = {
        id: data.id,
        username: data.username,
        email: data.email,
        avatarUrl: data.avatarUrl || "/default-avatar.svg",
        bio: data.description || "",
        followersCount: data.followersCount || 0,
        followingCount: data.followingCount || 0,
        postsCount: data.postsCount || 0,
        level: typeof data.level === "number" ? data.level : 1,
        reputationScore: data.reputationScore || 0,
        roles: data.roles || [],
      }
      setUser(mappedUser)
    } catch (error) {
      console.error("Failed to fetch user:", error)
      logout()
    } finally {
      setIsLoading(false)
    }
  }

  const login = (newToken: string, userData: any) => {
    localStorage.setItem("token", newToken)
    setToken(newToken)

    // Ánh xạ dữ liệu ban đầu
    const mappedUser: User = {
      id: userData?.id || "",
      username: userData?.username || "user",
      avatarUrl: userData?.avatarUrl || "/default-avatar.svg",
      level: typeof userData?.level === "number" ? userData.level : 1,
      reputationScore: userData?.reputationScore || 0
    }
    setUser(mappedUser)

    // Fetch lại cho chắc chắn lấy đủ thông tin
    fetchUser()
  }

  const updateUserData = (newData: any) => {
    if (!newData) return
    setUser((prev) => {
      if (!prev) return null
      return {
        ...prev,
        id: newData.id || prev.id,
        username: newData.username || prev.username,
        avatarUrl: newData.avatarUrl || prev.avatarUrl,
        bio: newData.description || prev.bio,
      }
    })
  }

  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
    setUser(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, fetchUser, updateUserData, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
