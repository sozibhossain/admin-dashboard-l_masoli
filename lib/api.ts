import axiosInstance from "./axios"
import type {
  ApiResponse,
  DashboardOverview,
  DashboardStats,
  RegistrationRate,
  UserGrowth,
  User,
  PaginationMeta,
  AreaOfLife,
  Priority,
  MotivationQuote,
  CoverMood,
  StaticPage,
  AdminNotification,
} from "@/types"

// ─── Auth ───────────────────────────────────────────
export const loginApi = (data: { email: string; password: string }) =>
  axiosInstance.post<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>("/auth/login", data)

export const forgotPasswordApi = (data: { email: string }) =>
  axiosInstance.post<ApiResponse<{ email: string; expiresIn: number; resendAfter: number }>>(
    "/auth/forgot-password",
    data
  )

export const resendOtpApi = (data: { email: string; type: "password_reset" | "email_verification" }) =>
  axiosInstance.post<ApiResponse<{ email: string; expiresIn: number; resendAfter: number }>>(
    "/auth/resend-otp",
    data
  )

export const verifyOtpApi = (data: {
  email: string
  otp: string
  type: "password_reset" | "email_verification"
}) =>
  axiosInstance.post<ApiResponse<{ resetToken: string; expiresIn: number }>>("/auth/verify-otp", data)

export const resetPasswordApi = (data: {
  resetToken: string
  newPassword: string
  confirmPassword: string
}) => axiosInstance.post<ApiResponse<null>>("/auth/reset-password", data)

export const changePasswordApi = (data: {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}) => axiosInstance.patch<ApiResponse<null>>("/auth/change-password", data)

// ─── Own Profile ─────────────────────────────────────
export const getMe = () => axiosInstance.get<ApiResponse<User>>("/users/me")

export const updateMe = (data: {
  userName?: string
  firstName?: string
  lastName?: string
  phone?: string
  bio?: string
  dateOfBirth?: string
  timezone?: string
}) => axiosInstance.patch<ApiResponse<User>>("/users/me", data)

// ─── Dashboard ──────────────────────────────────────
export const getDashboardStats = () =>
  axiosInstance.get<ApiResponse<DashboardStats>>("/admin/dashboard/stats")

export const getDashboardOverview = () =>
  axiosInstance.get<ApiResponse<DashboardOverview>>("/admin/dashboard/overview")

export const getRegistrationRate = (params?: { week?: string; start?: string }) =>
  axiosInstance.get<ApiResponse<RegistrationRate>>("/admin/dashboard/registration-rate", { params })

export const getUserGrowth = (params?: { year?: string }) =>
  axiosInstance.get<ApiResponse<UserGrowth>>("/admin/dashboard/user-growth", { params })

export const getRecentUsers = (params?: { limit?: number }) =>
  axiosInstance.get<ApiResponse<User[]>>("/admin/dashboard/recent-users", { params })

// ─── Users ─────────────────────────────────────────
export const listUsers = (params?: {
  page?: number
  limit?: number
  search?: string
  role?: string
  status?: string
  sort?: string
}) =>
  axiosInstance.get<ApiResponse<User[]>>("/admin/users", { params })

export const getUser = (id: string) =>
  axiosInstance.get<ApiResponse<User>>(`/admin/users/${id}`)

export const createUser = (data: {
  userName: string
  email: string
  password: string
  phone?: string
  role?: string
}) =>
  axiosInstance.post<ApiResponse<User>>("/admin/users", data)

export const updateUser = (id: string, data: Partial<User>) =>
  axiosInstance.patch<ApiResponse<User>>(`/admin/users/${id}`, data)

export const deleteUser = (id: string) =>
  axiosInstance.delete<ApiResponse<null>>(`/admin/users/${id}`)

export const updateUserStatus = (id: string, status: string) =>
  axiosInstance.patch<ApiResponse<User>>(`/admin/users/${id}/status`, { status })

export const updateUserRole = (id: string, role: string) =>
  axiosInstance.patch<ApiResponse<User>>(`/admin/users/${id}/role`, { role })

export const updateUserSubscription = (
  id: string,
  data: { tier: string; expiresAt?: string }
) =>
  axiosInstance.patch<ApiResponse<User>>(`/admin/users/${id}/subscription`, data)

// ─── Content: Areas of Life ──────────────────────────
export const listAreas = () =>
  axiosInstance.get<ApiResponse<AreaOfLife[]>>("/admin/content/areas")

export const createArea = (data: {
  name: string
  icon?: string
  color?: string
  order?: number
}) =>
  axiosInstance.post<ApiResponse<AreaOfLife>>("/admin/content/areas", data)

export const updateArea = (id: string, data: Partial<AreaOfLife>) =>
  axiosInstance.patch<ApiResponse<AreaOfLife>>(`/admin/content/areas/${id}`, data)

export const deleteArea = (id: string) =>
  axiosInstance.delete<ApiResponse<null>>(`/admin/content/areas/${id}`)

// ─── Content: Priorities ──────────────────────────
export const listPriorities = () =>
  axiosInstance.get<ApiResponse<Priority[]>>("/admin/content/priorities")

export const createPriority = (data: {
  name: string
  color?: string
  weight?: number
  order?: number
}) =>
  axiosInstance.post<ApiResponse<Priority>>("/admin/content/priorities", data)

export const updatePriority = (id: string, data: Partial<Priority>) =>
  axiosInstance.patch<ApiResponse<Priority>>(`/admin/content/priorities/${id}`, data)

export const deletePriority = (id: string) =>
  axiosInstance.delete<ApiResponse<null>>(`/admin/content/priorities/${id}`)

// ─── Content: Motivation Quotes ─────────────────────
export const listQuotes = () =>
  axiosInstance.get<ApiResponse<MotivationQuote[]>>("/admin/content/quotes")

export const createQuote = (data: { text: string; author?: string }) =>
  axiosInstance.post<ApiResponse<MotivationQuote>>("/admin/content/quotes", data)

export const updateQuote = (id: string, data: Partial<MotivationQuote>) =>
  axiosInstance.patch<ApiResponse<MotivationQuote>>(`/admin/content/quotes/${id}`, data)

export const deleteQuote = (id: string) =>
  axiosInstance.delete<ApiResponse<null>>(`/admin/content/quotes/${id}`)

// ─── Content: Cover Moods ────────────────────────────
export const listCoverMoods = () =>
  axiosInstance.get<ApiResponse<CoverMood[]>>("/admin/content/cover-moods")

export const createCoverMoods = (files: File[]) => {
  const formData = new FormData()
  files.forEach((file) => formData.append("images", file))
  return axiosInstance.post<ApiResponse<CoverMood[]>>("/admin/content/cover-moods", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
}

export const deleteCoverMood = (id: string) =>
  axiosInstance.delete<ApiResponse<CoverMood | null>>(`/admin/content/cover-moods/${id}`)

// ─── Content: Static Pages ───────────────────────────
export const getPage = (slug: string) =>
  axiosInstance.get<ApiResponse<StaticPage>>(`/admin/content/pages/${slug}`)

export const updatePage = (slug: string, data: { title: string; content: string }) =>
  axiosInstance.put<ApiResponse<StaticPage>>(`/admin/content/pages/${slug}`, data)

// ─── Admin Notifications ────────────────────────────
export const listNotifications = (params?: { page?: number; limit?: number }) =>
  axiosInstance.get<ApiResponse<AdminNotification[]>>("/admin/notifications", { params })

export const getUnreadNotificationCount = () =>
  axiosInstance.get<ApiResponse<number>>("/admin/notifications/unread-count")

export const markNotificationAsRead = (id: string) =>
  axiosInstance.patch<ApiResponse<null>>(`/admin/notifications/${id}/read`)

export const markAllNotificationsAsRead = () =>
  axiosInstance.patch<ApiResponse<null>>("/admin/notifications/read-all")

export const broadcastNotification = (data: { title: string; body?: string }) =>
  axiosInstance.post<ApiResponse<{ recipients: number }>>("/admin/notifications/broadcast", data)