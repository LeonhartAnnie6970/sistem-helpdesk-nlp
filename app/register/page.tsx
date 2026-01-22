"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ThemeProvider } from "@/components/theme-provider"
import { DIVISIONS } from "@/lib/divisions"
import { useSession, setSession } from "@/hooks/useSession"

function RegisterContent() {
  const router = useRouter()
  const { forceLogoutOnPublicPage } = useSession()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [divisi, setDivisi] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [sessionMessage, setSessionMessage] = useState("")

  // Security: If user navigates back from dashboard, force logout
  useEffect(() => {
    // Check for logout reason from session storage
    const logoutReason = sessionStorage.getItem("logoutReason")
    if (logoutReason) {
      setSessionMessage(logoutReason)
      sessionStorage.removeItem("logoutReason")
    }

    // Force logout if user has session but navigated to register page
    const wasLoggedIn = forceLogoutOnPublicPage()

    if (wasLoggedIn) {
      // Session was cleared, show message
      setSessionMessage("Anda harus login kembali untuk melanjutkan.")
    }

    setIsChecking(false)
  }, [forceLogoutOnPublicPage])

  // Show loading while checking authentication
  if (isChecking) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <div className="text-muted-foreground">Memeriksa sesi...</div>
      </main>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (!divisi) {
      setError("Please select a division")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, divisi }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Registration failed")
        return
      }

      // Save session data using the hook
      setSession({
        token: data.token,
        role: "user",
        userId: data.userId,
        userName: name,
        division: divisi,
      })

      // Use replace instead of push to prevent going back to register page
      router.replace("/dashboard")
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Daftar</CardTitle>
          <CardDescription>Buat akun baru</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {sessionMessage && (
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-sm rounded">
                {sessionMessage}
              </div>
            )}
            {error && <div className="p-3 bg-destructive/10 text-destructive text-sm rounded">{error}</div>}
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama</label>
              <Input
                type="text"
                placeholder="Nama Anda"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Divisi</label>
              <Select value={divisi} onValueChange={setDivisi}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih divisi Anda" />
                </SelectTrigger>
                <SelectContent>
                  {DIVISIONS.map((div) => (
                    <SelectItem key={div} value={div}>
                      {div}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Konfirmasi Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Loading..." : "Daftar"}
            </Button>
          </form>
          <p className="text-xs text-center text-muted-foreground mt-4">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Login di sini
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}

export default function RegisterPage() {
  return (
    <ThemeProvider>
      <RegisterContent />
    </ThemeProvider>
  )
}