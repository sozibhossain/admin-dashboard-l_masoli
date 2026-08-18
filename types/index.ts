export interface User {
  _id: string
  userName: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  phone: string
  role: "user" | "admin" | "super_admin"
  avatar: { url: string; publicId: string }
  bio: string
  dateOfBirth?: string
  timezone: string
  status: "active" | "inactive"
  isEmailVerified: boolean
  isDeleted: boolean
  age?: number | null
  lastActiveAt: string
  createdAt: string
  updatedAt: string
  joiningDate: string
  lastActiveLabel: string
  subscription: {
    tier: "free" | "premium"
    source: string
    startedAt: string | null
    expiresAt: string | null
  }
  stats?: UserStats
}

export interface UserStats {
  goals: number
  activeGoals: number
  completedGoals: number
  boards: number
  dreams: number
  totalMilestones: number
  completedMilestones: number
  milestonePercent: number
  badges: number
  avgCompletion: number
}

export interface DashboardStats {
  totalUsers: StatMetric
  activeUsers: StatMetric
}

export interface StatMetric {
  value: number
  percent: number
  changePercent: number
  trend: "up" | "down" | "flat"
}

export interface RegistrationRate {
  weekStart: string
  total: number
  series: Bucket[]
}

export interface Bucket {
  key: string
  label?: string
  count: number
  percent: number
}

export interface UserGrowth {
  year: number
  carryIn: number
  series: GrowthMonth[]
}

export interface GrowthMonth {
  month: string
  key: string
  newUsers: number
  totalUsers: number
}

export interface DashboardOverview {
  stats: DashboardStats
  registrationRate: RegistrationRate
  userGrowth: UserGrowth
  recentUsers: User[]
}

export interface AreaOfLife {
  _id: string
  name: string
  slug: string
  icon: string
  color: string
  order: number
  isActive: boolean
  user: string | null
  createdBy?: string
  createdAt: string
  updatedAt: string
}

export interface Priority {
  _id: string
  name: string
  slug: string
  color: string
  weight: number
  order: number
  isActive: boolean
  createdBy?: string
  createdAt: string
  updatedAt: string
}

export interface MotivationQuote {
  _id: string
  text: string
  author: string
  isActive: boolean
  createdBy?: string
  createdAt: string
  updatedAt: string
}

export interface CoverMood {
  _id: string
  title: string
  image: { url: string; publicId: string }
  isActive: boolean
  order: number
  createdBy?: string
  createdAt: string
  updatedAt: string
}

export interface StaticPage {
  _id: string
  title: string
  slug: string
  content: string
  updatedBy?: string
  createdAt: string
  updatedAt: string
}

export interface AdminNotification {
  _id: string
  title: string
  body: string
  type: string
  isRead: boolean
  audience: string
  createdAt: string
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data: T
  meta?: PaginationMeta
}