"use client"

import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { TicketForm } from "@/components/ticket-form"
import { TicketList } from "@/components/ticket-list"
import { ThemeProvider } from "@/components/theme-provider"
import { UserProfileModal } from "@/components/user-profile-modal"
import { User } from 'lucide-react'
import { AdminNotificationsPanel } from "@/components/admin-notifications-panel"

function DashboardContent() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [token, setToken] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("role")

    if (!token) {
      router.push("/login")
      return
    }

    if (role === "admin") {
      router.push("/admin/dashboard")
      return
    }

    setToken(token)
    setIsAuthenticated(true)
  }, [router])

  if (!isAuthenticated) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-2">
            <AdminNotificationsPanel token={token} />
          <Button
            onClick={() => setIsProfileOpen(true)}
            variant="outline"
            className="gap-2">
            <User className="w-4 h-4" />
            Profil
          </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <TicketForm onSuccess={() => setRefreshTrigger((prev) => prev + 1)} />
          </div>

          <div className="lg:col-span-2">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Tiket Saya</h2>
              <TicketList refreshTrigger={refreshTrigger} />
            </div>
          </div>
        </div>
      </div>

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        token={token}
      />
    </main>
  )
}

export default function DashboardPage() {
  return (
    <ThemeProvider>
      <DashboardContent />
    </ThemeProvider>
  )
}
