"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeProvider } from "@/components/theme-provider"
import { UserProfileModal } from "@/components/user-profile-modal"
import { DivisionMonitoringDashboard } from "@/components/division-monitoring-dashboard"
import { SuperAdminUserManagement } from "@/components/super-admin-user-management"
import { User, Shield } from "lucide-react"

function SuperAdminDashboardContent() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [token, setToken] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("role")

    if (!token || role !== "super_admin") {
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
      <header className="border-b bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
              <p className="text-sm opacity-90">Sistem Monitoring Divisi dengan NLP</p>
            </div>
          </div>
          <Button onClick={() => setIsProfileOpen(true)} variant="secondary" className="gap-2">
            <User className="w-4 h-4" />
            Profil
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="monitoring" className="space-y-4">
          <TabsList>
            <TabsTrigger value="monitoring">Monitoring Divisi</TabsTrigger>
            <TabsTrigger value="users">Kelola Users</TabsTrigger>
          </TabsList>

          <TabsContent value="monitoring" className="space-y-4">
            <DivisionMonitoringDashboard />
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <SuperAdminUserManagement />
          </TabsContent>
        </Tabs>
      </div>

      <UserProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} token={token} />
    </main>
  )
}

export default function SuperAdminDashboardPage() {
  return (
    <ThemeProvider>
      <SuperAdminDashboardContent />
    </ThemeProvider>
  )
}
