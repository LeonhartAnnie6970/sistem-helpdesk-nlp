"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ThemeProvider } from "@/components/theme-provider"
import { UserProfileModal } from "@/components/user-profile-modal"
import { DivisionMonitoringDashboard } from "@/components/division-monitoring-dashboard"
import { SuperAdminUserManagement } from "@/components/super-admin-user-management"
import { SuperAdminTicketsPanel } from "@/components/super-admin-tickets-panel"
import { AdminNotificationsPanel } from "@/components/admin-notifications-panel"
import { Sidebar } from "@/components/dashboard-sidebar"
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
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-black dark:text-white">
              {activeTab === "monitoring" && "Division Monitoring"}
              {activeTab === "tickets" && "All Tickets"}
              {activeTab === "users" && "User Management"}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {activeTab === "monitoring" && "Monitor performa semua divisi"}
              {activeTab === "tickets" && "Kelola semua ticket dari seluruh sistem"}
              {activeTab === "users" && "Kelola akun pengguna dan admin"}
            </p>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6 space-y-6 bg-white dark:bg-black">
          {activeTab === "monitoring" && <DivisionMonitoringDashboard />}
          {activeTab === "tickets" && <SuperAdminTicketsPanel token={token} />}
          {activeTab === "users" && <SuperAdminUserManagement />}
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
