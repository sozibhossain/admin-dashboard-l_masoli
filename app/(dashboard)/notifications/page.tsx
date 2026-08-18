"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  listNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  broadcastNotification,
} from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import Pagination from "@/components/pagination"
import { Bell, Send, CheckCheck, Loader2, Megaphone } from "lucide-react"
import { toast } from "sonner"
import { formatDateLabel } from "@/lib/utils"

export default function NotificationsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [broadcastOpen, setBroadcastOpen] = useState(false)
  const [broadcast, setBroadcast] = useState({ title: "", body: "" })
  const limit = 10

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", page],
    queryFn: async () => {
      const res = await listNotifications({ page, limit })
      return { notifications: res.data.data, meta: res.data.meta! }
    },
  })

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markNotificationAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  })

  const markAllReadMutation = useMutation({
    mutationFn: () => markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      toast.success("All notifications marked as read")
    },
  })

  const broadcastMutation = useMutation({
    mutationFn: () => broadcastNotification(broadcast),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      setBroadcastOpen(false)
      setBroadcast({ title: "", body: "" })
      toast.success(`Broadcast sent to ${res.data.data.recipients} users`)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            Manage admin notifications and broadcast announcements
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => markAllReadMutation.mutate()}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
          <Dialog open={broadcastOpen} onOpenChange={setBroadcastOpen}>
            <DialogTrigger asChild>
              <Button>
                <Megaphone className="h-4 w-4 mr-2" />
                Broadcast
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Broadcast Announcement</DialogTitle>
                <DialogDescription>
                  Send a notification to all active users.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={broadcast.title}
                    onChange={(e) =>
                      setBroadcast({ ...broadcast, title: e.target.value })
                    }
                    placeholder="Exciting news!"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Body</Label>
                  <Textarea
                    value={broadcast.body}
                    onChange={(e) =>
                      setBroadcast({ ...broadcast, body: e.target.value })
                    }
                    placeholder="Describe your announcement..."
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => broadcastMutation.mutate()}
                  disabled={broadcastMutation.isPending || !broadcast.title}
                >
                  {broadcastMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <Send className="h-4 w-4 mr-2" />
                  Send Broadcast
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))
          : data?.notifications?.map((notif: any) => (
              <div
                key={notif._id}
                className={`p-4 rounded-lg border transition-colors cursor-pointer hover:bg-accent/50 ${
                  !notif.isRead ? "border-l-4 border-l-primary bg-primary/5" : ""
                }`}
                onClick={() => {
                  if (!notif.isRead) markReadMutation.mutate(notif._id)
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <Bell
                      className={`h-5 w-5 mt-0.5 shrink-0 ${
                        !notif.isRead
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{notif.title}</p>
                      {notif.body && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {notif.body}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {notif.type?.replace(/_/g, " ")}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDateLabel(notif.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!notif.isRead && (
                    <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
                  )}
                </div>
              </div>
            ))}
        {data?.notifications?.length === 0 && (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground mt-3">No notifications yet</p>
          </div>
        )}
      </div>

      {data?.meta && (
        <Pagination
          page={data.meta.page}
          totalPages={data.meta.totalPages}
          total={data.meta.total}
          limit={limit}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}