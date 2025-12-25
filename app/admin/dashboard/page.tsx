"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminStats } from "@/components/admin-stats"
import { AdminDivisionTickets } from "@/components/admin-division-tickets"
import { ThemeProvider } from "@/components/theme-provider"
import { UserProfileModal } from "@/components/user-profile-modal"
import { AdminNotificationsPanel } from "@/components/admin-notifications-panel"
import { NLPReportGenerator } from "@/components/nlp-report-generator"
import { User } from "lucide-react"
import { stringify } from "querystring"

function AdminDashboardContent() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
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
      router.push("/admin-division/dashboard")
      return
    }

    if (role !== "super_admin") {
      router.push("/login")
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
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard (Legacy)</h1>
            <p className="text-sm text-muted-foreground">Redirecting to appropriate dashboard...</p>
          </div>
          <div className="flex items-center gap-2">
            <AdminNotificationsPanel token={token} />
            <Button onClick={() => setIsProfileOpen(true)} variant="outline" className="gap-2">
              <User className="w-4 h-4" />
              Profil
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="analytics" className="space-y-4">
          <TabsList>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="tickets">Kelola Tiket</TabsTrigger>
            <TabsTrigger value="reports">Laporan NLP</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-4">
            <AdminStats />
          </TabsContent>

          <TabsContent value="tickets" className="space-y-4">
            <AdminDivisionTickets token={token} />
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <NLPReportGenerator />
          </TabsContent>
        </Tabs>
      </div>

      <UserProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} token={token} />
    </main>
  )
}

export default function AdminDashboardPage() {
  return (
    <ThemeProvider>
      <AdminDashboardContent />
    </ThemeProvider>
  )
}
