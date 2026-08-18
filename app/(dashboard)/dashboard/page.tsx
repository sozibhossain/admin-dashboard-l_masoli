"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboardOverview } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Activity,
  UserPlus,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: async () => {
      const res = await getDashboardOverview();
      return res.data.data;
    },
  });

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-destructive text-lg font-medium">
          Failed to load dashboard
        </p>
        <p className="text-muted-foreground text-sm mt-1">
          Please try refreshing the page
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="lg:hidden">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back! Here&apos;s your overview.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <StatCard
          title="Total Users"
          value={data?.stats.totalUsers.value}
          percent={data?.stats.totalUsers.percent}
          changePercent={data?.stats.totalUsers.changePercent}
          trend={data?.stats.totalUsers.trend}
          icon={Users}
          isLoading={isLoading}
        />
        <StatCard
          title="Active Users (30d)"
          value={data?.stats.activeUsers.value}
          percent={data?.stats.activeUsers.percent}
          changePercent={data?.stats.activeUsers.changePercent}
          trend={data?.stats.activeUsers.trend}
          icon={Activity}
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Registration Rate - Bar Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-primary" />
              Registration Rate (This Week)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : data?.registrationRate ? (
              <>
                <p className="text-2xl font-bold mb-4">
                  {data.registrationRate.total}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    new users
                  </span>
                </p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data.registrationRate.series}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis
                      dataKey="key"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(val) => {
                        const d = new Date(val + "T00:00:00");
                        return d.toLocaleDateString("en-US", {
                          weekday: "short",
                        });
                      }}
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid hsl(var(--border))",
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </>
            ) : null}
          </CardContent>
        </Card>

        {/* User Growth - Line Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              User Growth ({data?.userGrowth?.year || new Date().getFullYear()})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : data?.userGrowth?.series ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data.userGrowth.series}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border))",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="totalUsers"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                    name="Total Users"
                  />
                  <Line
                    type="monotone"
                    dataKey="newUsers"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                    name="New Users"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Recent Users */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Users</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {data?.recentUsers?.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback className="text-xs">
                        {user.userName
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {user.userName || user.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant={
                        user.status === "active" ? "success" : "secondary"
                      }
                    >
                      {user.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      {user.joiningDate}
                    </span>
                  </div>
                </div>
              ))}
              {(!data?.recentUsers || data.recentUsers.length === 0) && (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No recent users found
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  percent,
  changePercent,
  trend,
  icon: Icon,
  isLoading,
}: {
  title: string;
  value?: number;
  percent?: number;
  changePercent?: number;
  trend?: string;
  icon: React.ElementType;
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-32" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">
              {value?.toLocaleString() || 0}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {trend &&
                (trend === "up" ? (
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                ) : trend === "down" ? (
                  <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                ) : null)}
              <p className="text-xs text-muted-foreground">
                {changePercent !== undefined && (
                  <span
                    className={
                      changePercent > 0
                        ? "text-emerald-500"
                        : changePercent < 0
                          ? "text-red-500"
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
  );
}
