"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { verifyOtpApi, resendOtpApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import AuthShell from "@/components/auth-shell"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

const OTP_LENGTH = 6


type OtpType = "password_reset" | "email_verification"

export default function VerifyOtpPage() {
  const router = useRouter()
  const [email] = useState<string | null>(() =>
    typeof window === "undefined" ? null : sessionStorage.getItem("otpEmail")
  )
  const [type] = useState<OtpType>(() => {
    if (typeof window === "undefined") return "password_reset"
    return (sessionStorage.getItem("otpType") as OtpType | null) || "password_reset"
  })
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (!email) router.replace("/forgot-password")
  }, [email, router])

  const verifyMutation = useMutation({
    mutationFn: () => verifyOtpApi({ email: email!, otp: digits.join(""), type }),
    onSuccess: (res) => {
      toast.success(res.data.message || "Code verified")
      if (res.data.data?.resetToken) {
        sessionStorage.setItem("resetToken", res.data.data.resetToken)
      }
      sessionStorage.removeItem("otpEmail")
      sessionStorage.removeItem("otpType")
      router.push("/reset-password")
    },
    onError: (error: Error) => toast.error(error.message || "Invalid or expired code"),
  })

  const resendMutation = useMutation({
    mutationFn: () => resendOtpApi({ email: email!, type }),
    onSuccess: (res) => toast.success(res.data.message || "A new code has been sent"),
    onError: (error: Error) => toast.error(error.message || "Failed to resend code"),
  })

  const setDigit = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    setDigits((prev) => {
      const next = [...prev]
      next[index] = value.slice(-1)
      return next
    })
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH)
    if (!pasted) return
    e.preventDefault()
    setDigits((prev) => {
      const next = [...prev]
      for (let i = 0; i < OTP_LENGTH; i++) next[i] = pasted[i] || next[i]
      return next
    })
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus()
  }

  const code = digits.join("")

  return (
    <AuthShell title="Verify Email" subtitle="Enter the OTP to verify your email">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (code.length === OTP_LENGTH) verifyMutation.mutate()
        }}
        className="space-y-6"
      >
        <div className="flex justify-center gap-2 sm:gap-3">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              className="h-14 w-12 sm:w-14 rounded-xl border border-input text-center text-lg font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t get a code?{" "}
          <button
            type="button"
            onClick={() => resendMutation.mutate()}
            disabled={resendMutation.isPending || !email}
            className="text-primary hover:underline disabled:opacity-50"
          >
            Resend
          </button>
        </p>
        <Button
          type="submit"
          className="w-full h-12"
          disabled={verifyMutation.isPending || code.length !== OTP_LENGTH}
        >
          {verifyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Verify
        </Button>
      </form>
    </AuthShell>
  )
}
