import { apiFetch } from "@/services/api.service"
import type { User } from "@/types"

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  refreshToken?: string
  user: User
}

/** Đăng nhập */
export async function login(body: LoginRequest): Promise<LoginResponse> {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

/** Đăng ký tài khoản mới */
export async function register(body: {
  username: string
  email: string
  password: string
}): Promise<User> {
  return apiFetch("/users/register", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

// ─── Users ────────────────────────────────────────────────────────────────────

/** Lấy thông tin user hiện tại (từ token) */
export async function getMe(): Promise<User> {
  return apiFetch("/users/me")
}

/** Lấy thông tin user theo ID */
export async function getUserById(userId: string): Promise<User> {
  return apiFetch(`/users/${userId}`)
}

/** Lấy tất cả users */
export async function getAllUsers(): Promise<User[]> {
  const res = await apiFetch("/users/getall?size=1000")
  return res.content || res
}

/** Cập nhật thông tin user */
export async function updateUser(
  userId: string,
  body: Partial<User> & { description?: string }
): Promise<User> {
  return apiFetch(`/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  })
}
