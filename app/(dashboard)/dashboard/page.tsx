"use client"

import { useQuery } from "@tanstack/react-query"
import { getDashboardOverview } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Activity,
  UserPlus,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts"
import { formatDate } from "@/lib/utils"

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: async () => {
      const res = await getDashboardOverview()
      return res.data.data
    },
  })

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-destructive text-lg font-medium">Failed to load dashboard</p>
        <p className="text-muted-foreground text-sm mt-1">Please try refreshing the page</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Your analytics overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
        <StatCard
          title="Total Users"
          value={data?.stats.totalUsers.value}
          percent={data?.stats.totalUsers.percent}
          changePercent={data?.stats.totalUsers.changePercent}
          trend={data?.stats.totalUsers.trend}
          icon={Users}
          bgColor="bg-[#E8F4F8]"
          iconBg="bg-[#00B4D8]"
          isLoading={isLoading}
        />
        <StatCard
          title="Active Users (30d)"
          value={data?.stats.activeUsers.value}
          percent={data?.stats.activeUsers.percent}
          changePercent={data?.stats.activeUsers.changePercent}
          trend={data?.stats.activeUsers.trend}
          icon={Activity}
          bgColor="bg-[#FFF3E0]"
          iconBg="bg-[#FF9800]"
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Bar Chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <UserPlus className="h-4 w-4 text-primary" />
              Registration Rate (This Week)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[260px] w-full" />
            ) : data?.registrationRate ? (
              <>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-bold">{data.registrationRate.total}</span>
                  <span className="text-sm text-muted-foreground">new users</span>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.registrationRate.series}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                    <XAxis
                      dataKey="key"
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val) => {
                        const d = new Date(val + "T00:00:00")
                        return d.toLocaleDateString("en-US", { weekday: "short" })
                      }}
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid hsl(var(--border))",
                        fontSize: "12px",
                      }}
                      labelFormatter={(val) => formatDate(val as string)}
                    />
                    <Bar dataKey="count" fill="#00B4D8" radius={[6, 6, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </>
            ) : null}
          </CardContent>
        </Card>

        {/* Area Chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-primary" />
              User Growth ({data?.userGrowth?.year || new Date().getFullYear()})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[260px] w-full" />
            ) : data?.userGrowth?.series ? (
              <>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-bold">
                    {data.userGrowth.series[data.userGrowth.series.length - 1]?.totalUsers || 0}
                  </span>
                  <span className="text-sm text-muted-foreground">total users</span>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={data.userGrowth.series}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00B4D8" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#00B4D8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid hsl(var(--border))",
                        fontSize: "12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="totalUsers"
                      stroke="#00B4D8"
                      strokeWidth={2}
                      fill="url(#colorUsers)"
                      name="Total Users"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Recent Users */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Recent Users</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="px-6 pb-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {data?.recentUsers?.map((user, idx) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between px-6 py-3.5 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                        {user.userName
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{user.userName || user.fullName}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      {user.joiningDate}
                    </span>
                    <Badge
                      variant={user.status === "active" ? "success" : "secondary"}
                      className="capitalize"
                    >
                      {user.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {(!data?.recentUsers || data.recentUsers.length === 0) && (
                <p className="text-sm text-muted-foreground py-8 text-center">No recent users found</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  title,
  value,
  percent,
  changePercent,
  trend,
  icon: Icon,
  bgColor,
  iconBg,
  isLoading,
}: {
  title: string
  value?: number
  percent?: number
  changePercent?: number
  trend?: string
  icon: React.ElementType
  bgColor: string
  iconBg: string
  isLoading: boolean
}) {
  return (
    <Card className={`${bgColor} border-0 shadow-sm`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-9 w-24 bg-white/50" />
            <Skeleton className="h-3 w-36 bg-white/50" />
          </div>
        ) : (
          <>
            <div className="text-3xl font-bold">{value?.toLocaleString() || 0}</div>
            <div className="flex items-center gap-1.5 mt-1.5">
              {trend &&
                (trend === "up" ? (
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                ) : trend === "down" ? (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                ) : null)}
              <p className="text-xs text-muted-foreground">
                {changePercent !== undefined && (
                  <span
                    className={
                      changePercent > 0
                        ? "text-emerald-600 font-medium"
                        : changePercent < 0
                          ? "text-red-600 font-medium"
                          : ""
                    }
                  >
                    {changePercent > 0 ? "+" : ""}
                    {changePercent}%{" "}
                  </span>
                )}
                {percent !== undefined && `${percent}% of target`}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}