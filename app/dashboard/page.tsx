"use client"

import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import { Sidebar } from "@/components/dashboard-sidebar"
import { TicketForm } from "@/components/ticket-form"
import { TicketList } from "@/components/ticket-list"
import { ThemeProvider } from "@/components/theme-provider"
import { UserProfileModal } from "@/components/user-profile-modal"
import { UserNotificationsPanel } from "@/components/user-notifications-panel"
import { Button } from "@/components/ui/button"
import { Plus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

function DashboardContent() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [token, setToken] = useState("")
  const [activeTab, setActiveTab] = useState("dashboard")
  const [notificationCount, setNotificationCount] = useState(0)
  const [showNewTicketForm, setShowNewTicketForm] = useState(false)

  useEffect(() => {
  const storedToken = localStorage.getItem("token")
  if (!storedToken) {
    router.push("/login")
    return
  }

  setToken(storedToken)

  fetch("/api/user/profile", {
    headers: { Authorization: `Bearer ${storedToken}` },
  })
    .then(res => res.json())
    .then(data => {
      if (data.role === "admin") {
        router.push("/admin/dashboard")
        return
      }

      // user biasa
      setIsAuthenticated(true)
      fetchNotificationCount(storedToken)
    })
    .catch(() => router.push("/login"))
}, [router])


  const fetchNotificationCount = async (token: string) => {
    try {
      const response = await fetch("/api/user/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setNotificationCount(data.unreadCount || 0)
    } catch (error) {
      console.error("Error fetching notification count:", error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userId")
    localStorage.removeItem("role")
    router.push("/login")
  }

  const handleTicketSuccess = () => {
    setRefreshTrigger((prev) => prev + 1)
    setShowNewTicketForm(false)
  }

  const handleOpenNotifications = () => {
    setShowNotifications(!showNotifications)
  }

  if (!isAuthenticated) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        role="user"
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenNotifications={handleOpenNotifications}
        notificationCount={notificationCount}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto ml-64 transition-all duration-300">
        {/* Top Bar - Minimal Header */}
        <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold">
                {activeTab === "dashboard" ? "Dashboard" : "Tiket Saya"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {activeTab === "dashboard" 
                  ? "Selamat datang di helpdesk system" 
                  : "Kelola dan monitor ticket Anda"}
              </p>
            </div>
            
            {activeTab === "my-tickets" && (
              <Button onClick={() => setShowNewTicketForm(!showNewTicketForm)}>
                <Plus className="w-4 h-4 mr-2" />
                Buat Tiket Baru
              </Button>
            )}
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6 space-y-6">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Welcome Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Selamat Datang! 👋</CardTitle>
                  <CardDescription>
                    Gunakan sistem ini untuk melaporkan masalah atau pertanyaan Anda
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      className="h-24" 
                      variant="outline"
                      onClick={() => {
                        setActiveTab("my-tickets")
                        setShowNewTicketForm(true)
                      }}
                    >
                      <div className="text-center">
                        <Plus className="w-6 h-6 mx-auto mb-2" />
                        <p className="font-medium">Buat Tiket Baru</p>
                        <p className="text-xs text-muted-foreground">Laporkan masalah Anda</p>
                      </div>
                    </Button>
                    <Button 
                      className="h-24" 
                      variant="outline"
                      onClick={() => setActiveTab("my-tickets")}
                    >
                      <div className="text-center">
                        <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="font-medium">Lihat Tiket Saya</p>
                        <p className="text-xs text-muted-foreground">Monitor status ticket</p>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Tickets Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Tiket Terbaru</CardTitle>
                  <CardDescription>Ticket yang baru saja Anda buat</CardDescription>
                </CardHeader>
                <CardContent>
                  <TicketList refreshTrigger={refreshTrigger} />
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "my-tickets" && (
            <div className="space-y-6">
              {/* New Ticket Form */}
              {showNewTicketForm && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Buat Tiket Baru</CardTitle>
                        <CardDescription>Laporkan masalah atau pertanyaan Anda</CardDescription>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowNewTicketForm(false)}
                      >
                        Tutup
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <TicketForm onSuccess={handleTicketSuccess} />
                  </CardContent>
                </Card>
              )}

              {/* Tickets List */}
              <Card>
                <CardHeader>
                  <CardTitle>Semua Tiket Saya</CardTitle>
                  <CardDescription>Daftar semua ticket yang pernah Anda buat</CardDescription>
                </CardHeader>
                <CardContent>
                  <TicketList refreshTrigger={refreshTrigger} />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Notification Panel - Positioned from sidebar */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black/20 z-50" onClick={() => setShowNotifications(false)}>
          <div 
            className="fixed left-64 top-16 w-96 max-h-[calc(100vh-80px)] bg-background border rounded-lg shadow-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <UserNotificationsPanel token={token} />
          </div>
        </div>
      )}

      {/* Modals */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        token={token}
      />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ThemeProvider>
      <DashboardContent />
    </ThemeProvider>
  )
}