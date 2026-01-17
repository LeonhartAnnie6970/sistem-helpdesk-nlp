"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ThemeProvider } from "@/components/theme-provider"
import { UserProfileModal } from "@/components/user-profile-modal"
import { DivisionMonitoringDashboard } from "@/components/division-monitoring-dashboard"
import { SuperAdminUserManagement } from "@/components/super-admin-user-management"
import { SuperAdminTicketsPanel } from "@/components/super-admin-tickets-panel"
import { AdminNotificationsPanel } from "@/components/admin-notifications-panel"
import { TicketDetailModal } from "@/components/ticket-detail-modal"
import { Sidebar } from "@/components/dashboard-sidebar"
import { TicketForm } from "@/components/ticket-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

function SuperAdminDashboardContent() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [token, setToken] = useState("")
  const [notificationCount, setNotificationCount] = useState(0)
  const [activeTab, setActiveTab] = useState("monitoring")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showNewTicketForm, setShowNewTicketForm] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null)
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false)

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    const role = localStorage.getItem("role")

    if (!storedToken || role !== "super_admin") {
      router.push("/login")
      return
    }

    setToken(storedToken)
    setIsAuthenticated(true)

    // Fetch initial notification count
    fetchNotificationCount(storedToken)

    // Poll for notifications every 30 seconds
    const interval = setInterval(() => {
      fetchNotificationCount(storedToken)
    }, 30000)

    return () => clearInterval(interval)
  }, [router])

  const fetchNotificationCount = async (token: string) => {
    try {
      const response = await fetch("/api/admin/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setNotificationCount(data.unreadCount || 0)
    } catch (error) {
      console.error("Error fetching notification count:", error)
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    router.push("/login")
  }

  const handleTicketSuccess = () => {
    setRefreshTrigger((prev) => prev + 1)
    setShowNewTicketForm(false)
  }

  const handleOpenTicketDetail = (ticketId: number) => {
    setSelectedTicketId(ticketId)
    setIsTicketModalOpen(true)
  }

  const handleCloseTicketDetail = () => {
    setIsTicketModalOpen(false)
    setSelectedTicketId(null)
  }

  const handleTicketUpdate = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-white dark:bg-black">
      {/* Sidebar */}
      <Sidebar
        role="super_admin"
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenNotifications={() => setShowNotifications(!showNotifications)}
        notificationCount={notificationCount}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Main Content */}
      <main className={cn(
        "flex-1 overflow-y-auto transition-all duration-300 bg-white dark:bg-black",
        sidebarCollapsed ? "ml-16" : "ml-64"
      )}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold text-black dark:text-white">
                {activeTab === "monitoring" && "Division Monitoring"}
                {activeTab === "tickets" && "All Tickets"}
                {activeTab === "users" && "User Management"}
                {activeTab === "create-ticket" && "Buat Tiket Baru"}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {activeTab === "monitoring" && "Monitor performa semua divisi"}
                {activeTab === "tickets" && "Kelola semua ticket dari seluruh sistem"}
                {activeTab === "users" && "Kelola akun pengguna dan admin"}
                {activeTab === "create-ticket" && "Buat tiket atas nama super admin"}
              </p>
            </div>
            {activeTab === "create-ticket" && (
              <Button onClick={() => setShowNewTicketForm(!showNewTicketForm)} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                {showNewTicketForm ? "Tutup Form" : "Buat Tiket"}
              </Button>
            )}
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6 space-y-6 bg-white dark:bg-black">
          {activeTab === "monitoring" && <DivisionMonitoringDashboard />}
          {activeTab === "tickets" && <SuperAdminTicketsPanel token={token} onTicketClick={handleOpenTicketDetail} refreshTrigger={refreshTrigger} />}
          {activeTab === "users" && <SuperAdminUserManagement />}

          {activeTab === "create-ticket" && (
            <div className="space-y-6">
              {showNewTicketForm && (
                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
                  <CardHeader className="bg-white dark:bg-black">
                    <CardTitle className="text-black dark:text-white">Buat Tiket Baru</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      Buat tiket sebagai super admin
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="bg-white dark:bg-black">
                    <TicketForm onSuccess={handleTicketSuccess} />
                  </CardContent>
                </Card>
              )}

              {!showNewTicketForm && (
                <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
                  <CardHeader className="bg-white dark:bg-black">
                    <CardTitle className="text-black dark:text-white">Buat Tiket Baru</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      Klik tombol di atas untuk membuat tiket baru
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="bg-white dark:bg-black flex items-center justify-center py-12">
                    <Button onClick={() => setShowNewTicketForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Buat Tiket Baru
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Notification Panel */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black/20 z-50" onClick={() => setShowNotifications(false)}>
          <div
            className={cn(
              "fixed top-16 w-96 max-h-[calc(100vh-80px)] bg-background border rounded-lg shadow-lg overflow-hidden transition-all duration-300",
              sidebarCollapsed ? "left-16" : "left-64"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <AdminNotificationsPanel
              token={token}
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
              onUnreadCountChange={(count) => setNotificationCount(count)}
              onTicketClick={(ticketId) => {
                setShowNotifications(false)
                setActiveTab("tickets")
                handleOpenTicketDetail(ticketId)
              }}
            />
          </div>
        </div>
      )}

      {/* Modals */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        token={token}
      />

      <TicketDetailModal
        isOpen={isTicketModalOpen}
        onClose={handleCloseTicketDetail}
        ticketId={selectedTicketId}
        onUpdate={handleTicketUpdate}
      />
    </div>
  )
}

export default function SuperAdminDashboardPage() {
  return (
    <ThemeProvider>
      <SuperAdminDashboardContent />
    </ThemeProvider>
  )
}