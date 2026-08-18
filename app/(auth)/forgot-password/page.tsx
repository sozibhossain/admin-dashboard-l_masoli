"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { forgotPasswordApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import AuthShell from "@/components/auth-shell"
import { Mail, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")

  const mutation = useMutation({
    mutationFn: () => forgotPasswordApi({ email }),
    onSuccess: (res) => {
      toast.success(res.data.message || "Verification code sent")
      sessionStorage.setItem("otpEmail", email)
      sessionStorage.setItem("otpType", "password_reset")
      router.push("/verify-otp")
    },
    onError: (error: Error) => toast.error(error.message || "Failed to send code"),
  })

  return (
    <AuthShell title="Forgot Password" subtitle="Enter your email to recover your password">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          mutation.mutate()
        }}
        className="space-y-6"
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="h-12 rounded-full pl-11"
            />
          </div>
        </div>
        <Button type="submit" className="w-full h-12" disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Send OTP
        </Button>
      </form>
    </AuthShell>
  )
}
