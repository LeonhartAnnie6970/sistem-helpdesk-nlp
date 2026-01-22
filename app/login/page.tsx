"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ThemeProvider } from "@/components/theme-provider"
import { useSession, setSession } from "@/hooks/useSession"
import { AlertCircle, Clock } from "lucide-react"

function LoginContent() {
  const router = useRouter()
  const { forceLogoutOnPublicPage } = useSession()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [sessionMessage, setSessionMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  // Security: If user navigates back from dashboard, force logout
  useEffect(() => {
    // Check for logout reason from session storage
    const logoutReason = sessionStorage.getItem("logoutReason")
    if (logoutReason) {
      setSessionMessage(logoutReason)
      sessionStorage.removeItem("logoutReason")
    }

    // Force logout if user has session but navigated to login page
    const wasLoggedIn = forceLogoutOnPublicPage()

    if (wasLoggedIn) {
      // Session was cleared, show message
      setSessionMessage("Anda harus login kembali untuk melanjutkan.")
    }

    setIsChecking(false)
  }, [forceLogoutOnPublicPage])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSessionMessage("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Login failed")
        return
      }

      // Save session data using the hook
      setSession({
        token: data.token,
        role: data.role,
        userId: data.userId,
        userName: data.userName || data.name || email,
        division: data.division,
      })

      // Use replace instead of push to prevent going back to login page
      if (data.role === "super_admin") {
        router.replace("/super-admin/dashboard")
      } else if (data.role === "admin") {
        router.replace("/admin/dashboard")
      } else {
        router.replace("/dashboard")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading while checking authentication
  if (isChecking) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <div className="text-muted-foreground">Memeriksa sesi...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Masuk ke Sistem Monitoring Divisi</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Session expired message */}
            {sessionMessage && (
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-sm rounded flex items-center gap-2">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span>{sessionMessage}</span>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive text-sm rounded flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Loading..." : "Login"}
            </Button>
          </form>
          <p className="text-xs text-center text-muted-foreground mt-4">
            Belum punya akun?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Daftar di sini
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}

export default function LoginPage() {
  return (
    <ThemeProvider>
      <LoginContent />
    </ThemeProvider>
  )
}
