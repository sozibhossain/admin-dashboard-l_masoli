"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { resetPasswordApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import AuthShell from "@/components/auth-shell"
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [resetToken] = useState<string | null>(() =>
    typeof window === "undefined" ? null : sessionStorage.getItem("resetToken")
  )
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    if (!resetToken) router.replace("/forgot-password")
  }, [resetToken, router])

  const mutation = useMutation({
    mutationFn: () => resetPasswordApi({ resetToken: resetToken!, newPassword, confirmPassword }),
    onSuccess: (res) => {
      toast.success(res.data.message || "Password reset successfully")
      sessionStorage.removeItem("resetToken")
      router.push("/login")
    },
    onError: (error: Error) => toast.error(error.message || "Failed to reset password"),
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
    <AuthShell title="Reset Password" subtitle="Create a new password">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Create New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            className="h-12 rounded-full pl-11 pr-11"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            className="h-12 rounded-full pl-11 pr-11"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <Button type="submit" className="w-full h-12" disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Change Password
        </Button>
      </form>
    </AuthShell>
  )
}
