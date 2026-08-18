"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getMe, updateMe, changePasswordApi } from "@/lib/api"
import type { User } from "@/types"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { Pencil, Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"

type Tab = "personal" | "password"

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("personal")

  const { data: user, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: async () => (await getMe()).data.data,
  })

  const initials =
    user?.userName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "A"

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Settings</h1>
        <div className="flex gap-2 bg-muted p-1 rounded-full w-fit">
          <button
            onClick={() => setTab("personal")}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              tab === "personal" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            )}
          >
            Personal Information
          </button>
          <button
            onClick={() => setTab("password")}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              tab === "password" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            )}
          >
            Change Password
          </button>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6">
        {isLoading ? (
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user?.avatar?.url} alt={user?.userName} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-bold">{user?.fullName || user?.userName}</p>
              <p className="text-sm text-muted-foreground">@{user?.role}</p>
            </div>
          </div>
        )}
      </div>

      {tab === "personal" ? (
        isLoading || !user ? (
          <PersonalInfoSkeleton />
        ) : (
          <PersonalInfoCard key={user._id} user={user} />
        )
      ) : (
        <ChangePasswordCard />
      )}
    </div>
  )
}

function PersonalInfoSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-6 space-y-4">
      <Skeleton className="h-6 w-40" />
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  )
}

function PersonalInfoCard({ user }: { user: User }) {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    phone: user.phone || "",
    bio: user.bio || "",
  })

  const mutation = useMutation({
    mutationFn: () => updateMe(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] })
      setEditing(false)
      toast.success("Personal information updated")
    },
    onError: (error: Error) => toast.error(error.message || "Failed to update"),
  })

  return (
    <div className="rounded-xl border bg-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Personal Information</h3>
        {editing ? (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Save
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="h-3.5 w-3.5 mr-1" />
            Edit
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First Name" editing={editing} value={form.firstName}
          onChange={(v) => setForm({ ...form, firstName: v })} />
        <Field label="Last Name" editing={editing} value={form.lastName}
          onChange={(v) => setForm({ ...form, lastName: v })} />
        <Field label="Email Address" editing={false} value={user.email} onChange={() => {}} />
        <Field label="Phone" editing={editing} value={form.phone}
          onChange={(v) => setForm({ ...form, phone: v })} />
        <div className="sm:col-span-2 space-y-1.5">
          <Label className="text-muted-foreground">Bio</Label>
          {editing ? (
            <Textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={4}
            />
          ) : (
            <p className="text-sm min-h-10 py-2">{user.bio || "—"}</p>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  editing,
  value,
  onChange,
}: {
  label: string
  editing: boolean
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-muted-foreground">{label}</Label>
      {editing ? (
        <Input value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <p className="text-sm h-9 flex items-center">{value || "—"}</p>
      )}
    </div>
  )
}

function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [show, setShow] = useState({ current: false, next: false, confirm: false })

  const mutation = useMutation({
    mutationFn: () => changePasswordApi({ currentPassword, newPassword, confirmPassword }),
    onSuccess: (res) => {
      toast.success(res.data.message || "Password changed successfully")
      signOut({ redirect: true, callbackUrl: "/login" })
    },
    onError: (error: Error) => toast.error(error.message || "Failed to change password"),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    mutation.mutate()
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-6 space-y-4">
      <h3 className="text-lg font-semibold">Change password</h3>
      <div className="grid gap-4 md:grid-cols-3">
        <PasswordField
          label="Current Password"
          value={currentPassword}
          onChange={setCurrentPassword}
          visible={show.current}
          onToggle={() => setShow({ ...show, current: !show.current })}
        />
        <PasswordField
          label="New Password"
          value={newPassword}
          onChange={setNewPassword}
          visible={show.next}
          onToggle={() => setShow({ ...show, next: !show.next })}
        />
        <PasswordField
          label="Confirm New Password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          visible={show.confirm}
          onToggle={() => setShow({ ...show, confirm: !show.confirm })}
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </form>
  )
}

function PasswordField({
  label,
  value,
  onChange,
  visible,
  onToggle,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  visible: boolean
  onToggle: () => void
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="relative">
        <Input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          minLength={8}
          className="pr-9"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}
