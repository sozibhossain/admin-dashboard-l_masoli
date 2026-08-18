"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Settings as SettingsIcon } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Application settings and configuration
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <SettingsIcon className="h-4 w-4 text-primary" />
              API Configuration
            </CardTitle>
            <CardDescription>
              The base URL for the backend API is configured via environment variables.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label>API Base URL</Label>
              <Input
                value={process.env.NEXT_PUBLIC_BASE_URL || "Not set"}
                readOnly
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label>NextAuth URL</Label>
              <Input
                value={process.env.NEXTAUTH_URL || "Not set"}
                readOnly
                className="font-mono text-xs"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <SettingsIcon className="h-4 w-4 text-primary" />
              About
            </CardTitle>
            <CardDescription>
              Dream Board Admin Dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">
              This admin dashboard allows you to manage users, content, and
              notifications for the Dream Board application.
            </p>
            <p className="text-sm text-muted-foreground">
              Built with Next.js, shadcn/ui, TanStack Query, and NextAuth.js.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}